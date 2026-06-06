# Portfolio Ibai Fernandez

Portfolio estático personal orientado a mostrar experiencia en Front-End, marketing y contenido.

**Live:** https://portfolio.ibaifernandez.com

---

## Stack

- HTML5 + CSS3 + JavaScript (jQuery + plugins)
- Node.js build pipeline (`scripts/build-pages.mjs`) — páginas + assets `.min` generados desde fuentes legibles
- Contenido data-driven en `content/*.json`
- Netlify CDN (hosting + deploys atómicos)
- Netlify Functions (Node.js 20) — formulario de contacto
- Resend API — entrega de emails transaccionales
- GitHub Actions — CI/CD (`ci.yml`)

> **No requiere PHP.** El formulario de contacto corre en `netlify/functions/contact.js`.

---

## Ejecutar en local

```bash
# Servidor estático básico (para testing sin funciones)
npm run start
# Abre: http://localhost:4173

# Servidor completo con Netlify Functions
netlify dev
# Abre en el puerto configurado en netlify.toml (actualmente :4173)
```

---

## Calidad y testing

Pruebas sin dependencias externas:

```bash
npm run test:quality   # quality-guards.sh + checks de cobertura
bash tests/smoke.sh    # humo básico con servidor levantado
```

Suite E2E profesional (Playwright):

```bash
npm install
npx playwright install chromium
npm run test:e2e
```

Pipeline local equivalente a CI:

```bash
npm run test:ci
```

---

## Build de páginas

```bash
npm run build:pages    # genera index.html, privacy.html, los 4 dossiers públicos activos y assets .min derivados
```

> Los archivos `*.html` en la raíz son GENERADOS. No los edites directamente.
> Los assets versionados `assets/css/*.min.css` y `assets/js/*.min.js` también son GENERADOS por `npm run build:pages`.
> Edita `src/pages/*.template.html` y `src/components/**/*.html`, luego ejecuta el build.
> Para cambiar CSS/JS servido en producción, edita las fuentes legibles (`assets/css/*.css`, `assets/js/*.js`) y vuelve a generar.

---

## Contenido data-driven

Los datos de cards, slides y timelines se gestionan en:

- `content/projects.json`
- `content/projects.archived.json`
- `content/testimonials.json`
- `content/training.json`
- `content/ctas.json`
- `content/services.json`
- `content/experience.json`

Contrato actual:

- `content/projects.json` = catálogo público activo que sí entra en build, homepage y navegación entre dossiers.
- `content/projects.archived.json` = dossiers preservados en el repo pero retirados de la superficie pública actual.

---

## Optimización de imágenes (AVIF/WebP + fallback)

```bash
npm run media:all      # genera assets modernos para todas las páginas HTML del root y recompila
npm run test:avif      # valida cobertura AVIF
npm run test:webp      # valida cobertura WebP
```

Estado actual: la cobertura AVIF/WebP ya se valida sobre todas las páginas generadas del root (`index`, `privacy` y dossiers públicos) y no quedan faltantes de WebP en los quality guards.

---

## Qué valida cada script

### `tests/quality-guards.sh`

- No uso de `eval(` en JS de formulario.
- No enlaces con `href=""` ni `href="javascript:;"`.
- No `target="_blank"` sin `rel="noopener noreferrer"`.
- No URL claramente rota (`https://https://...`).
- Presencia de headers de seguridad clave en `netlify.toml`.
- Presencia de campos anti-spam (`website`, `form_started_at`, `captcha_provider`, `captcha_token`) y su validación backend.
- Presencia de `skip-link` de teclado a contenido principal.
- Presencia de contenedor de estado accesible del formulario (`aria-live`).
- Validación de carga lazy en dependencias no críticas.
- Las imágenes críticas de `index.html` mantienen `loading`, `width` y `height`.
- Presupuesto de rendimiento por página y por tipo de asset.
- Cobertura AVIF y WebP en imágenes grandes (fallback real con `<picture>`).
- Validación de render data-driven (si falta un campo requerido en `content/*.json`, el build falla).
- Checker de enlaces rotos internos/anclas.
- Baseline de accesibilidad en CSS (`focus-visible` + `prefers-reduced-motion`).

### `tests/smoke.sh`

- El sitio levanta por HTTP local.
- `index.html` responde y contiene marcadores clave.

### `tests/e2e/` (Playwright)

- `home.spec.js` — Render del home y bloques críticos. Sidebar, skip-link, AVIF/WebP, idioma, hardening de links.
- `contact.spec.js` — Feedback accesible, validación de email, envío válido, timing guard real del endpoint.
- `keyboard.spec.js` — Tab order para navegación crítica (skip-link, sidebar anchors, formulario, redes sociales).
- `a11y.spec.js` — Axe WCAG 2.1 A + AA sin violaciones en Home.
- `dossiers.spec.js` — Navegación prev/next cerrada sobre el set público activo.
- `dossier-pages.spec.js` — Por dossier (matriz derivada de `content/projects.json`): render, botón de idioma nativo, toggle `<html lang>`, links externos endurecidos, axe WCAG.
- `archived-dossiers.spec.js` — Los slugs archivados rebotan al índice de proyectos en vez de resolver como dossiers públicos.
- `cookie-consent.spec.js` — Banner mostrar/aceptar/rechazar, persistencia, reapertura, sin cookie GA antes del consentimiento.
- `csp.spec.js` — Enforcement de Content-Security-Policy en runtime.
- `visual.spec.js` — Regresión visual de referencia para secciones clave (ver `docs/TESTING.md` para el contrato de baselines).

Pruebas unitarias del build (`tests/build/*.test.mjs`) vía `npm run test:unit`. Inventario completo de tests y gates en **`docs/TESTING.md`**.

Nota de producto: el portfolio ya no tiene blog público. La ruta heredada `/blog` / `/blog.html` redirige al home y los proyectos son la única superficie editorial pública.
La superficie pública activa es la definida por `content/projects.json` (actualmente: `scanner-21179.html`, `crm-aglaya.html`, `kanban-desk.html`, `aglaya-outreach.html`). Esa es la fuente de verdad — no edites listas de dossiers a mano aquí.

---

## Anti-spam avanzado (rollout controlado)

El formulario mantiene flujo actual por defecto y permite activar captcha sin cambiar plantilla:

- **Frontend** runtime config (en `src/components/shared/analytics-ga4.html`):
  - `window.PORTFOLIO_RUNTIME.captcha.provider`: `turnstile`, `recaptcha` o `hcaptcha`
  - `window.PORTFOLIO_RUNTIME.captcha.siteKey`: site key pública
- **Backend** (`netlify/functions/contact.js`) por variables de entorno Netlify:
  - `FROM_EMAIL` (opcional; fallback: `info@ibaifernandez.com`)
  - `TO_EMAIL` (opcional; fallback: `info@ibaifernandez.com`)
  - `PORTFOLIO_CAPTCHA_PROVIDER` (`turnstile`/`recaptcha`/`hcaptcha`)
  - `PORTFOLIO_CAPTCHA_SECRET` (secret key — nunca commitear)

Contrato actual de producción: honeypot + timing check + captcha opcional. El mock local usado por `scripts/static-server.mjs` replica ese mismo contrato para E2E.

Ver rotación de claves y procedimiento completo en `docs/ENGINEERING-RUNBOOK.md`.

---

## Presupuesto de rendimiento

```bash
npm run test:budget
```

Config: `tests/performance-budget.config.json`. Para bloques `<picture>`, el budget cuenta el asset preferido (AVIF/WebP) y evita doble conteo con el fallback.

---

## Link checker

```bash
npm run test:links           # enlaces internos y anclas locales
npm run test:links:external  # añade validación HTTP externa
```

Workflow programado: `.github/workflows/link-health.yml` (lunes 09:00 UTC + ejecución manual).

---

## Deploy

Cada push a `main` desencadena un único workflow:

1. **GitHub Actions `ci.yml`** — install + build + quality guards + Playwright + deploy a Netlify (solo si todo pasa).

Variables de entorno necesarias en Netlify Dashboard: `RESEND_API_KEY`, `FROM_EMAIL`, `TO_EMAIL`. Opcionales para captcha: `PORTFOLIO_CAPTCHA_PROVIDER`, `PORTFOLIO_CAPTCHA_SECRET`, `PORTFOLIO_CAPTCHA_MIN_SCORE`.

---

## Documentación

| Documento | Contenido |
|---|---|
| `AGENTS.md` (root) | Guía para agentes de IA. Punto de entrada operativo. |
| `docs/README.md` | Mapa de navegación de `docs/`. |
| `docs/ROADMAP.md` | Estado actual, etapa, pendientes. SSOT operativo. |
| `docs/ARCHITECTURE.md` | Arquitectura técnica + build pipeline. |
| `docs/SECURITY.md` | Política de seguridad: CSP, headers, form defense. |
| `docs/AI_RULES.md` | Reglas extendidas para agentes IA. |
| `docs/brand-audit-narrative-b.md` | Brand reference activo (Narrative B). |
| `docs/audits/marianas/` | Auditoría profunda 2026-05-22 + log de ejecución. |

---

## Siguiente evolución recomendada

1. Re-capturar PageSpeed post-accesibilidad + minificación + media y comparar contra la baseline del 2026-03-03.
2. Promover CSP de report-only a enforce (Phase 6).
3. Reescribir narrativa de home por impacto (problema → solución → resultado).
4. Google Search Console + sitemap + validación real de Turnstile en producción.
