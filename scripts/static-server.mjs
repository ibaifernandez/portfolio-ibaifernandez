#!/usr/bin/env node
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { URL } from 'node:url';

const args = process.argv.slice(2);
const portArgIndex = args.findIndex((value) => value === '--port');
const port = portArgIndex >= 0 ? Number(args[portArgIndex + 1]) : 4173;
const host = '127.0.0.1';
const root = process.cwd();
const minSubmitDelayMs = 1200;
const maxFormLifetimeMs = 86400000;
const cooldownMs = 20000;
const ipRateLimitWindowMs = Number(process.env.PORTFOLIO_RATE_LIMIT_WINDOW_SECONDS || 600) * 1000;
const ipRateLimitMaxRequests = Number(process.env.PORTFOLIO_RATE_LIMIT_MAX_REQUESTS || 12);
const captchaProvider = (process.env.PORTFOLIO_CAPTCHA_PROVIDER || '').toLowerCase().trim();
const captchaSecret = (process.env.PORTFOLIO_CAPTCHA_SECRET || '').trim();
const enforceCaptcha = (captchaProvider === 'recaptcha' || captchaProvider === 'hcaptcha' || captchaProvider === 'turnstile') && captchaSecret !== '';
const sessionCookieName = 'portfolio_sid';
const lastSubmissionBySession = new Map();
const submissionCountByIp = new Map();

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8'
};

function send(res, statusCode, content, contentType = 'text/plain; charset=utf-8', extraHeaders = {}) {
  res.writeHead(statusCode, {
    'Content-Type': contentType,
    'Cache-Control': 'no-cache',
    ...extraHeaders
  });
  res.end(content);
}

function parseCookies(rawCookieHeader) {
  if (!rawCookieHeader) {
    return {};
  }

  return rawCookieHeader.split(';').reduce((acc, entry) => {
    const [rawKey, ...rest] = entry.trim().split('=');
    if (!rawKey) {
      return acc;
    }
    acc[rawKey] = decodeURIComponent(rest.join('='));
    return acc;
  }, {});
}

function parseMultipartFormData(body, contentType) {
  const boundaryMatch = contentType.match(/boundary=(?:"([^"]+)"|([^;]+))/i);
  const boundary = boundaryMatch?.[1] || boundaryMatch?.[2];
  const parsed = new Map();

  if (!boundary) {
    return parsed;
  }

  const marker = `--${boundary}`;
  const parts = body.split(marker);
  for (const rawPart of parts) {
    const part = rawPart.trim();
    if (!part || part === '--') {
      continue;
    }

    const sections = part.split('\r\n\r\n');
    if (sections.length < 2) {
      continue;
    }

    const headers = sections[0];
    const value = sections
      .slice(1)
      .join('\r\n\r\n')
      .replace(/\r\n$/, '');
    const nameMatch = headers.match(/name="([^"]+)"/i);
    if (!nameMatch) {
      continue;
    }

    parsed.set(nameMatch[1], value);
  }

  return parsed;
}

function parseFormFields(body, contentType) {
  const fields = new Map();
  const mimeType = (contentType || '').toLowerCase();

  if (mimeType.includes('application/json')) {
    try {
      const parsed = JSON.parse(body);
      if (parsed && typeof parsed === 'object') {
        for (const [key, value] of Object.entries(parsed)) {
          fields.set(key, String(value ?? ''));
        }
      }
    } catch {}
    return fields;
  }

  if (mimeType.includes('application/x-www-form-urlencoded')) {
    const params = new URLSearchParams(body);
    for (const [key, value] of params.entries()) {
      fields.set(key, value);
    }
    return fields;
  }

  if (mimeType.includes('multipart/form-data')) {
    return parseMultipartFormData(body, contentType);
  }

  return fields;
}

function resolveSession(req) {
  const cookies = parseCookies(req.headers.cookie || '');
  const existing = cookies[sessionCookieName];

  if (existing) {
    return {
      id: existing,
      headers: {}
    };
  }

  const id = crypto.randomUUID();
  return {
    id,
    headers: {
      'Set-Cookie': `${sessionCookieName}=${id}; Path=/; HttpOnly; SameSite=Lax`
    }
  };
}

function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.trim() !== '') {
    return forwarded.split(',')[0].trim();
  }
  return req.socket.remoteAddress || 'unknown';
}

function handleAjax(req, res) {
  const session = resolveSession(req);
  if (req.method === 'GET') {
    return send(res, 200, '0', 'text/plain; charset=utf-8', session.headers);
  }

  if (req.method === 'POST') {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk.toString('utf8');
      if (body.length > 1_000_000) {
        req.destroy();
      }
    });
    req.on('end', () => {
      const fields = parseFormFields(body, req.headers['content-type'] || '');
      const formType = fields.get('form_type') || '';
      const honeypot = (fields.get('website') || '').trim();
      const email = (fields.get('email') || '').trim();
      const captchaToken = (fields.get('captcha_token') || '').trim();
      const startedAt = Number(fields.get('form_started_at') || 0);
      const now = Date.now();
      const formAgeMs = now - startedAt;
      const clientIp = getClientIp(req);
      const lastSubmission = lastSubmissionBySession.get(session.id) || 0;
      const isCoolingDown = (now - lastSubmission) < cooldownMs;
      const ipHistory = submissionCountByIp.get(clientIp) || [];
      const recentIpSubmissions = ipHistory.filter((timestamp) => (now - timestamp) < ipRateLimitWindowMs);
      const isIpRateLimited = recentIpSubmissions.length >= ipRateLimitMaxRequests;
      if (!isIpRateLimited) {
        recentIpSubmissions.push(now);
      }
      submissionCountByIp.set(clientIp, recentIpSubmissions);
      const hasValidTiming = Number.isFinite(startedAt) &&
        startedAt > 0 &&
        formAgeMs >= minSubmitDelayMs &&
        formAgeMs <= maxFormLifetimeMs;
      const hasValidCaptcha = !enforceCaptcha || captchaToken !== '';

      if (
        formType === 'contact' &&
        honeypot === '' &&
        hasValidTiming &&
        email.includes('@') &&
        !isCoolingDown &&
        !isIpRateLimited &&
        hasValidCaptcha
      ) {
        lastSubmissionBySession.set(session.id, now);
        send(res, 200, '1', 'text/plain; charset=utf-8', session.headers);
      } else {
        send(res, 200, '0', 'text/plain; charset=utf-8', session.headers);
      }
    });
    return;
  }

  send(res, 405, 'Method Not Allowed', 'text/plain; charset=utf-8', session.headers);
}

const server = http.createServer((req, res) => {
  if (!req.url) {
    return send(res, 400, 'Bad Request');
  }

  const parsedUrl = new URL(req.url, `http://${host}:${port}`);
  let pathname = decodeURIComponent(parsedUrl.pathname);

  if (pathname === '/ajax.php' || pathname === '/.netlify/functions/contact') {
    return handleAjax(req, res);
  }

  if (pathname === '/') {
    pathname = '/index.html';
  }

  if (pathname.endsWith('/')) {
    pathname = `${pathname}index.html`;
  }

  const fullPath = path.resolve(root, `.${pathname}`);
  if (!fullPath.startsWith(root)) {
    return send(res, 403, 'Forbidden');
  }

  fs.stat(fullPath, (statError, stats) => {
    if (statError || !stats.isFile()) {
      return send(res, 404, 'Not Found');
    }

    const ext = path.extname(fullPath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'no-cache'
    });

    const stream = fs.createReadStream(fullPath);
    stream.on('error', () => send(res, 500, 'Internal Server Error'));
    stream.pipe(res);
  });
});

server.listen(port, host, () => {
  console.log(`Static server running at http://${host}:${port}`);
});
