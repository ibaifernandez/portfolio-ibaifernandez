# Owner actions — cierre del audit 2026-06-05

6 cosas que **no se pueden arreglar desde el repo** (viven en dashboards, DNS o son
decisiones tuyas). Ninguna bloquea producción; son el "último 5%" para el 10/10.
Marca cada una al cerrarla.

---

## 1. GA4 — retención + Google Signals  ·  ~3 min  ·  (L-PRIV-09)

La política ya declara **14 meses**; hay que ponerlo de verdad en GA4.

- [ ] Analytics → **Admin** → (propiedad `G-T8FTTWBQS3`) → **Data settings → Data retention**.
- [ ] *Event data retention* → **14 months** → Save.
- [ ] Admin → **Data collection** → desactiva **Google Signals** (si está on).
- [ ] Confirma que no hay enlaces a Google Ads (Admin → Product links).

**Por qué:** minimización de datos (RGPD Art.5(1)(e)). Ya lo prometes en la política;
esto lo hace cierto.

---

## 2. DNS — SPF / DKIM / DMARC del dominio de Resend  ·  ~15 min + propagación  ·  (B-FUNC-03)

Sin esto, cualquiera puede falsificar tu `FROM_EMAIL` y la auto-respuesta puede generar
backscatter.

- [ ] Resend → **Domains** → tu dominio remitente → sigue las instrucciones DKIM/SPF
      que te da Resend (te dan los registros TXT exactos).
- [ ] Añade en tu DNS los TXT de **SPF** (`v=spf1 include:...resend... ~all`) y **DKIM**
      (el CNAME/TXT que indique Resend).
- [ ] Añade un **DMARC**: TXT en `_dmarc.tudominio` →
      `v=DMARC1; p=quarantine; rua=mailto:info@ibaifernandez.com`.
- [ ] Espera propagación, verifica el dominio en Resend (todo en verde).

**Por qué:** anti-spoofing + entregabilidad. Es config de correo, no de la web.

---

## 3. Activar el captcha (fail-closed)  ·  ~10 min  ·  (B-FUNC-02)

El código ya está listo y testeado; solo faltan las llaves. Recomendado: **Cloudflare
Turnstile** (gratis).

- [ ] Cloudflare → **Turnstile** → *Add site* → dominio `portfolio.ibaifernandez.com`.
      Copia **Site Key** (pública) y **Secret Key** (privada).
- [ ] Netlify → Site → **Environment variables**:
      - `PORTFOLIO_CAPTCHA_PROVIDER` = `turnstile`
      - `PORTFOLIO_CAPTCHA_SECRET` = (la Secret Key)
      - `PORTFOLIO_CAPTCHA_REQUIRED` = `1`   ← activa el rechazo si el captcha no aplica
- [ ] El front necesita la **Site Key** para pintar el widget. Avísame y la cableo
      (es un cambio pequeño en el template del formulario); o si ya hay un sitio para
      la site key, ponla ahí.
- [ ] Redeploy y prueba un envío real.

**Por qué:** hoy el form se apoya solo en honeypot + timing + rate-limit. Con esto, bots
con captcha fallido quedan fuera de verdad.

---

## 4. Netlify — confirmar deploy gated + runbook de rollback  ·  ~5 min  ·  (A-OPS-10)

El deploy a producción lo hace **CI por CLI** tras pasar todo el gate (quality + claim
+ unit + smoke + e2e). Si el auto-build de Git de Netlify está ON, podría publicar un
build sin pasar e2e.

- [ ] Netlify → Site configuration → **Build & deploy** → **Stop builds** (o desactiva
      el auto-publish del repo). Que solo despliegue el CLI desde CI.
- [ ] Rollback (apúntalo): Netlify → **Deploys** → elige el deploy anterior bueno →
      **Publish deploy**. Vuelve en segundos.

**Por qué:** un solo camino de publicación, siempre gateado; rollback en 1 clic.

---

## 5. Lighthouse / PageSpeed en producción  ·  ~5 min  ·  (P-PERF-08)

Las Core Web Vitals reales solo se miden contra el deploy. Acabamos de quitar ~126 KB
de CSS bloqueante (purge de Bootstrap) — vale la pena ver el número.

- [ ] [PageSpeed Insights](https://pagespeed.web.dev/) → `https://portfolio.ibaifernandez.com`
      → corre **Mobile** y **Desktop**.
- [ ] Repite en `…/scanner-21179`.
- [ ] Si LCP sigue alto, dímelo y miramos el siguiente cuello (probablemente imagen
      hero o `style.min.css`).

**Por qué:** cerrar el loop de perf con datos reales, no estáticos.

---

## 6. Aviso legal — identidad fiscal  ·  ~10 min  ·  (L-PRIV-04)

La política ya nombra autoridades de control (AEPD/Chile/ANPD) y al responsable
(Ibai Fernández + email). Para un aviso legal LSSI-CE completo falta tu identidad fiscal.

- [ ] Decide régimen: ¿autónomo/profesional registrado (España) u otra jurisdicción?
- [ ] Si España: pásame **nombre fiscal completo + NIF + domicilio** y añado un bloque
      de *aviso legal* en `privacy.template.html` (sección nueva).
- [ ] Si es estrictamente personal bajo otra jurisdicción: dímelo y documento qué
      régimen aplica (nombre + email ya es defendible).

**Por qué:** LSSI-CE Art.10 pide establecimiento identificable si operas comercialmente
desde España. Yo no puedo inventar tus datos fiscales.

---

## Fuera de alcance por decisión — SEO bilingüe (SEO-BILINGUAL-01)

**Qué es, en humano:** hoy el sitio es bilingüe con **una sola URL por página**. El
idioma lo cambia JavaScript en el navegador (botón de la banderita): la misma
`index.html` se reescribe a inglés o español al vuelo. Google, en cambio, indexa el
**HTML que llega del servidor** (inglés por defecto). La versión española no tiene una
URL propia que Google pueda guardar por separado.

**Consecuencia:** el español rankea peor de lo que podría, porque para Google "no
existe" como página independiente — es la misma URL con JS encima.

**La alternativa "correcta" de SEO:** servir dos URLs reales, p.ej. `/en/` y `/es/`,
cada una con su HTML ya traducido desde el servidor y enlaces `hreflang` recíprocos.
Así Google indexa ambas y cada idioma compite por su cuenta.

**Por qué NO lo hicimos:** es un **cambio arquitectónico grande** (XL). Habría que
duplicar la generación de páginas por idioma, rehacer el routing, los `canonical`, el
sitemap, los tests… Es un proyecto en sí mismo, no un arreglo de audit. Y para un
portafolio personal el coste/beneficio no es obvio: ganas algo de SEO en español a
cambio de bastante complejidad de mantenimiento.

**Recomendación:** déjalo como decisión consciente. Si algún día el tráfico orgánico en
español importa de verdad (campaña, mercado LATAM/España), lo abordamos como proyecto
dedicado. Mientras tanto, está **marcado y documentado**, no olvidado.
