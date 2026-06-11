# Owner actions — cierre del audit 2026-06-05

6 cosas que **no se pueden arreglar desde el repo** (viven en dashboards, DNS o son
decisiones tuyas). Ninguna bloquea producción; son el "último 5%" para el 10/10.
Marca cada una al cerrarla.

**Estado: ✅ todas completadas — 2026-06-11**

---

## 1. GA4 — retención + Google Signals  ·  ✅ DONE 2026-06-11  ·  (L-PRIV-09)

- [x] *Event data retention* → **14 months** → guardado.
- [x] Google Signals → **OFF**.
- [x] Sin enlaces a Google Ads (AdSense ni Ads Product links).

---

## 2. DNS — SPF / DKIM / DMARC del dominio de Resend  ·  ✅ DONE 2026-06-11  ·  (B-FUNC-03)

- [x] Dominio `ibaifernandez.com` verificado en Resend (DKIM + SPF en verde).
- [x] DMARC `_dmarc.ibaifernandez.com` añadido en Cloudflare DNS.

---

## 3. Activar el captcha (fail-closed)  ·  ✅ DONE 2026-06-11  ·  (B-FUNC-02)

- [x] Widget Turnstile existente reutilizado (site key ya estaba hardcoded en `analytics-ga4.html`).
- [x] Variables en Netlify: `PORTFOLIO_CAPTCHA_PROVIDER=turnstile`,
      `PORTFOLIO_CAPTCHA_SECRET` (corregido: era `_KEY`, ahora sin sufijo),
      `PORTFOLIO_CAPTCHA_REQUIRED=1`.
- [x] `.env` local corregido: `PORTFOLIO_CAPTCHA_SECRET_KEY` → `PORTFOLIO_CAPTCHA_SECRET`.

---

## 4. Netlify — deploy gated + runbook de rollback  ·  ✅ DONE 2026-06-11  ·  (A-OPS-10)

- [x] Auto-builds de Git detenidos en Netlify UI ("Stopped builds").
- [x] Único camino de deploy: CLI desde CI tras gate completo (quality + claim + unit + smoke + e2e).
- [x] Rollback: Netlify → **Deploys** → deploy anterior → **Publish deploy**.

---

## 5. Lighthouse / PageSpeed en producción  ·  ✅ DONE 2026-06-11  ·  (P-PERF-08)

PSI ejecutado tras font preloads + font-display:fallback (commit `8b6c90e`) y testimonials (commit `54b9610`):

| Página | Dispositivo | Score | LCP |
|---|---|---|---|
| homepage | Mobile | 90 | 3.4s (era 4.0s) |
| homepage | Desktop | 92 | 1.2s |
| scanner-21179 | Mobile | 77 | 5.0s (era 6.1s) |
| scanner-21179 | Desktop | 97 | 1.3s |

Siguiente palanca scanner mobile: imágenes hero del dossier.

---

## 6. Aviso legal — identidad fiscal  ·  ✅ DONE 2026-06-11  ·  (L-PRIV-04)

- [x] Sección 8 LSSI-CE añadida en `privacy.template.html` (commit `268e31c`).
      Datos: Antonio Ibai Fernández Gutiérrez · NIF 74853234X · C/ Juan de Ortega,
      s/n, 29190, Málaga · info@ibaifernandez.com.
      Nota: profesional freelance independiente con carácter itinerante; la dirección
      es el domicilio postal registrado en España.

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
