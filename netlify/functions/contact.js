'use strict';

/**
 * netlify/functions/contact.js
 * Contact form handler — puerto de ajax.php para Netlify Functions.
 *
 * Variables de entorno configurables (configurar en Netlify UI →
 * Site configuration → Environment variables):
 *
 *   RESEND_API_KEY               Resend API key (requerida)
 *   FROM_EMAIL                   Remitente verificado en Resend (opcional)
 *   TO_EMAIL                     Destinatario de mensajes del formulario (opcional)
 *   PORTFOLIO_CAPTCHA_PROVIDER     "turnstile" | "recaptcha" | "hcaptcha"
 *   PORTFOLIO_CAPTCHA_SECRET       Captcha secret key
 *   PORTFOLIO_CAPTCHA_MIN_SCORE    (opcional) float 0-1, solo para reCAPTCHA v3
 *   PORTFOLIO_CAPTCHA_REQUIRED     (opcional) "1" para rechazar si el captcha no
 *                                  puede aplicarse (fail-closed, B-FUNC-02)
 *   PORTFOLIO_RATE_LIMIT_MAX       (opcional) máx. envíos por IP/ventana (def. 5)
 *   PORTFOLIO_RATE_LIMIT_WINDOW_MS (opcional) ventana en ms (def. 600000 = 10 min)
 *
 * Qué se porta de ajax.php y qué cambia:
 *   ✅ Honeypot (campo "website")
 *   ✅ Timing check (form_started_at)
 *   ✅ Validación y saneamiento de campos
 *   ✅ Verificación de captcha (Turnstile / reCAPTCHA / hCaptcha)
 *   ✅ Rate limit por IP best-effort en memoria (B-FUNC-01). Las instancias
 *      serverless se reutilizan en caliente, así que esto frena a un atacante que
 *      pega contra una misma instancia; para límite GLOBAL añadir una regla de
 *      rate-limit de Netlify o un store compartido (Netlify Blobs / Upstash).
 *   🔄 mail() → Resend API
 *
 * DELIVERABILITY / ANTI-SPOOFING (acción del propietario, B-FUNC-03):
 *   Configurar SPF + DKIM + DMARC para el dominio remitente en Resend para evitar
 *   spoofing del FROM_EMAIL y backscatter de la auto-respuesta. No verificable
 *   desde el repo; vive en la config DNS/Resend.
 */

const { Resend } = require('resend');

// ── Constantes ────────────────────────────────────────────────────────────────
const MIN_SUBMIT_DELAY_MS  = 1_200;
const MAX_FORM_LIFETIME_MS = 86_400_000; // 24 h
const RATE_LIMIT_MAX       = parseInt(process.env.PORTFOLIO_RATE_LIMIT_MAX || '5', 10);
const RATE_LIMIT_WINDOW_MS = parseInt(process.env.PORTFOLIO_RATE_LIMIT_WINDOW_MS || '600000', 10);

// Best-effort in-memory rate-limit bucket, keyed by client IP. Persists across
// invocations on a warm instance only (see header note for the global caveat).
const rateBuckets = new Map();

// ── Entorno ───────────────────────────────────────────────────────────────────
const RESEND_API_KEY    = process.env.RESEND_API_KEY || '';
const FROM_EMAIL        = (process.env.FROM_EMAIL || 'info@ibaifernandez.com').trim();
const TO_EMAIL          = (process.env.TO_EMAIL || 'info@ibaifernandez.com').trim();
const CAPTCHA_PROVIDER  = (process.env.PORTFOLIO_CAPTCHA_PROVIDER || '').toLowerCase().trim();
const CAPTCHA_SECRET    = (process.env.PORTFOLIO_CAPTCHA_SECRET || '').trim();
const CAPTCHA_MIN_SCORE = parseFloat(process.env.PORTFOLIO_CAPTCHA_MIN_SCORE || '0');

// ── Helpers ───────────────────────────────────────────────────────────────────
function getClientIp(headers) {
  // x-nf-client-connection-ip es el header que Netlify inyecta con la IP real.
  const order = ['x-nf-client-connection-ip', 'cf-connecting-ip', 'x-forwarded-for'];
  for (const key of order) {
    const raw = (headers[key] || '').trim();
    if (!raw) continue;
    return raw.split(',')[0].trim();
  }
  return '';
}

function sanitizeSingleLine(val, max) {
  return String(val ?? '').replace(/[\r\n]/g, ' ').trim().slice(0, max);
}

function sanitizeMultiline(val, max) {
  return String(val ?? '').replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim().slice(0, max);
}

// Respuestas: mismos literales que ajax.php ('1' / '0') para no tocar el frontend.
function ok()   { return { statusCode: 200, headers: { 'Content-Type': 'text/plain; charset=utf-8' }, body: '1' }; }
function fail() { return { statusCode: 200, headers: { 'Content-Type': 'text/plain; charset=utf-8' }, body: '0' }; }

function shouldEnforceCaptcha() {
  return ['recaptcha', 'hcaptcha', 'turnstile'].includes(CAPTCHA_PROVIDER) && CAPTCHA_SECRET !== '';
}

const CAPTCHA_REQUIRED = ['1', 'true', 'yes'].includes(
  (process.env.PORTFOLIO_CAPTCHA_REQUIRED || '').toLowerCase().trim()
);

// Returns true if this IP has exceeded RATE_LIMIT_MAX submissions within the
// sliding window. Prunes expired timestamps; bounds memory opportunistically.
function isRateLimited(ip) {
  if (!ip) return false; // can't key without an IP — don't block legitimate users
  const now = Date.now();
  const cutoff = now - RATE_LIMIT_WINDOW_MS;
  const hits = (rateBuckets.get(ip) || []).filter((t) => t > cutoff);
  if (hits.length >= RATE_LIMIT_MAX) {
    rateBuckets.set(ip, hits);
    return true;
  }
  hits.push(now);
  rateBuckets.set(ip, hits);
  if (rateBuckets.size > 5_000) {
    for (const [key, times] of rateBuckets) {
      const fresh = times.filter((t) => t > cutoff);
      if (fresh.length === 0) rateBuckets.delete(key);
      else rateBuckets.set(key, fresh);
    }
  }
  return false;
}

async function verifyCaptchaToken(token, remoteIp) {
  if (!token) return false;
  const urls = {
    hcaptcha:  'https://hcaptcha.com/siteverify',
    recaptcha: 'https://www.google.com/recaptcha/api/siteverify',
    turnstile: 'https://challenges.cloudflare.com/turnstile/v0/siteverify',
  };
  const verifyUrl = urls[CAPTCHA_PROVIDER];
  if (!verifyUrl) return false;

  const params = new URLSearchParams({ secret: CAPTCHA_SECRET, response: token });
  if (remoteIp) params.set('remoteip', remoteIp);

  let res;
  try {
    res = await fetch(verifyUrl, {
      method:  'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body:    params.toString(),
      signal:  AbortSignal.timeout(8_000),
    });
  } catch {
    return false;
  }

  if (!res.ok) return false;
  const data = await res.json().catch(() => ({}));
  if (!data.success) return false;

  if (
    CAPTCHA_PROVIDER === 'recaptcha' &&
    CAPTCHA_MIN_SCORE > 0 &&
    typeof data.score === 'number' &&
    data.score < CAPTCHA_MIN_SCORE
  ) {
    return false;
  }

  return true;
}

// ── Handler ───────────────────────────────────────────────────────────────────
exports.handler = async function handler(event) {
  // Solo POST
  if (event.httpMethod !== 'POST') return fail();

  // El frontend envía JSON (application/json)
  let body;
  try {
    const raw = event.isBase64Encoded
      ? Buffer.from(event.body || '', 'base64').toString('utf8')
      : (event.body || '');
    body = JSON.parse(raw);
  } catch {
    return fail();
  }

  if (!body || typeof body !== 'object') return fail();

  // form_type guard — equivalente al check de ajax.php
  if (body.form_type !== 'contact') return fail();

  // Honeypot — campo oculto "website": si tiene valor, es un bot
  if (String(body.website || '').trim() !== '') return fail();

  // Rate limit por IP (best-effort, B-FUNC-01) — frena email-bombing / abuso de coste.
  const clientIp = getClientIp(event.headers || {});
  if (isRateLimited(clientIp)) return fail();

  // Timing check — el formulario debe haberse abierto hace entre 1.2 s y 24 h
  const formStartedAt = parseInt(body.form_started_at || '0', 10);
  const elapsed       = Date.now() - formStartedAt;
  if (formStartedAt <= 0 || elapsed < MIN_SUBMIT_DELAY_MS || elapsed > MAX_FORM_LIFETIME_MS) {
    return fail();
  }

  // Captcha
  if (shouldEnforceCaptcha()) {
    const token = String(body.captcha_token || '').trim();
    if (!(await verifyCaptchaToken(token, clientIp))) return fail();
  } else if (CAPTCHA_REQUIRED || (CAPTCHA_PROVIDER && !CAPTCHA_SECRET)) {
    // Fail closed (B-FUNC-02): captcha was explicitly required, or a provider was
    // configured without its secret (a misconfiguration). Refuse rather than
    // silently accepting on honeypot+timing alone.
    console.error('[contact] captcha required but not enforceable — set PORTFOLIO_CAPTCHA_PROVIDER + PORTFOLIO_CAPTCHA_SECRET');
    return fail();
  }

  // Extracción y saneamiento de campos
  let   fullName  = sanitizeSingleLine(body.full_name,  160);
  const firstName = sanitizeSingleLine(body.first_name, 80);
  const lastName  = sanitizeSingleLine(body.last_name,  80);
  const emailRaw  = String(body.email || '').trim();
  const subject   = sanitizeSingleLine(body.subject,   180);
  const message   = sanitizeMultiline(body.message,  5_000);

  if (!fullName) fullName = `${firstName} ${lastName}`.trim();

  // Validación de email (equivalente a FILTER_VALIDATE_EMAIL de PHP)
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailRaw);
  if (!emailValid || !message) return fail();

  const email       = emailRaw;
  const mailSubject = subject || 'Contact form message';
  const safeFirst   = firstName || fullName || 'there';
  const safeName    = fullName  || safeFirst;

  // Escape HTML básico para el cuerpo del email (equivalente a htmlspecialchars)
  const esc = (s) => String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

  // ── Envío via Resend ───────────────────────────────────────────────────────
  if (!RESEND_API_KEY) {
    console.error('[contact] RESEND_API_KEY no está configurada');
    return fail();
  }

  const resend = new Resend(RESEND_API_KEY);

  try {
    // Auto-respuesta al remitente
    await resend.emails.send({
      from:    `Ibai Fernández <${FROM_EMAIL}>`,
      to:      [email],
      replyTo: [FROM_EMAIL],
      subject: 'Thank you for your message',
      html: [
        `Dear ${esc(safeFirst)},`,
        '<br><br>',
        'Thank you for reaching out to me. I have received your message regarding ',
        `&quot;${esc(mailSubject)}&quot; `,
        'and I will get back to you as soon as possible.',
        '<br><br>Best regards,<br>',
        '<a href="https://portfolio.ibaifernandez.com" target="_blank" rel="noopener noreferrer">',
        '~Ibai Fernández</a>',
      ].join(''),
    });

    // Notificación al propietario
    await resend.emails.send({
      from:    `Portfolio Contact <${FROM_EMAIL}>`,
      to:      [TO_EMAIL],
      replyTo: [email],
      subject: mailSubject,
      html: [
        '<p>Hello,</p>',
        `<p>${esc(safeName)} has sent a message with <strong>${esc(mailSubject)}</strong> `,
        `as the subject from <strong>${esc(email)}</strong>:</p>`,
        `<p>${esc(message).replace(/\n/g, '<br>')}</p>`,
      ].join(''),
    });

    return ok();
  } catch (err) {
    console.error('[contact] Resend error:', err?.message ?? err);
    return fail();
  }
};
