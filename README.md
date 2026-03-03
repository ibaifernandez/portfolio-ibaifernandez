# Portfolio Ibai Fernandez

Portfolio estático personal orientado a mostrar experiencia en Front-End, marketing y contenido.

**Live:** https://ibaifernandez.com

---

## Stack

- HTML5 + CSS3 + JavaScript (jQuery + plugins)
- Node.js build pipeline (`scripts/build-pages.mjs`) — páginas generadas desde templates
- Contenido data-driven en `content/*.json`
- Netlify CDN (hosting + deploys atómicos)
- Netlify Functions (Node.js 20) — formulario de contacto
- Resend API — entrega de emails transaccionales
- GitHub Actions — CI/CD (`quality.yml` + `e2e.yml`)

> **No requiere PHP.** El formulario de contacto corre en `netlify/functions/contact.mjs`.

---

## Ejecutar en local

```bash
# Servidor estático básico (para testing sin funciones)
npm run start
# Abre: http://localhost:3000

# Servidor completo con Netlify Functions
netlify dev
# Abre: http://localhost:8888
```

---

## Calidad y testing

Pruebas sin dependencias externas:

```bash
npm run test:quality   # quality-guards.sh + checks de cobertura
bash tests/smoke.sh    # humo básico con servidor levantado
```

Suite E2E profesional (Playwright, 29 tests):

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
npm run build:pages    # genera index.html, blog.html, cv-print.html, project-*.html
```

> Los archivos `*.html` en la raíz son GENERADOS. No los edites directamente.
> Edita `src/pages/*.template.html` y `src/components/**/*.html`, luego ejecuta el build.

---

## Contenido data-driven

Los datos de cards, slides y timelines se gestionan en:

- `content/projects.json`
- `content/testimonials.json`
- `content/training.json`
- `content/ctas.json`
- `content/services.json`
- `content/experience.json`

---

## Optimización de imágenes (AVIF/WebP + fallback)

```bash
npm run media:all      # genera AVIF + WebP para todas las imágenes
npm run test:avif      # valida cobertura AVIF
npm run test:webp      # valida cobertura WebP
```

Estado actual: 29 imágenes con fuente AVIF y 29 con fuente WebP, servidas con `<picture>` y fallback al original.

---

## Qué valida cada script

### `tests/quality-guards.sh`

- No uso de `eval(` en JS de formulario.
- No enlaces con `href=""` ni `href="javascript:;"`.
- No `target="_blank"` sin `rel="noopener noreferrer"`.
- No URL claramente rota (`https://https://...`).
- Presencia de headers de seguridad clave en `.htaccess`.
- Presencia de campos anti-spam (`website`, `form_started_at`, `captcha_provider`, `captcha_token`) y su validación backend.
- Presencia de `skip-link` de teclado a contenido principal.
- Presencia de contenedor de estado accesible del formulario (`aria-live`).
- Validación de carga lazy en dependencias no críticas.
- Todas las imágenes en `index.html` y `blog.html` tienen `loading`, `width` y `height`.
- Presupuesto de rendimiento por página y por tipo de asset.
- Cobertura AVIF y WebP en imágenes grandes (fallback real con `<picture>`).
- Validación de render data-driven (si falta un campo requerido en `content/*.json`, el build falla).
- Checker de enlaces rotos internos/anclas.
- Baseline de accesibilidad en CSS (`focus-visible` + `prefers-reduced-motion`).

### `tests/smoke.sh`

- El sitio levanta por HTTP local.
- `index.html` responde y contiene marcadores clave.

### `tests/e2e/` (Playwright, 29 tests)

- `home.spec.js` — Render del home y bloques críticos. Sidebar, skip-link, AVIF/WebP, idioma, hardening de links.
- `contact.spec.js` — Feedback accesible, validación de email, envío válido, cooldown backend.
- `blog.spec.js` — Render crítico de `blog.html`. Links sociales accesibles. No overflow horizontal en móvil.
- `keyboard.spec.js` — Tab order para navegación crítica (skip-link, sidebar anchors, formulario, redes sociales).
- `a11y.spec.js` — Axe sin violaciones `serious/critical` en Home, Contact y shell técnica del blog.
- `visual.spec.js` — Regresión visual de referencia para secciones clave.

---

## Anti-spam avanzado (rollout controlado)

El formulario mantiene flujo actual por defecto y permite activar captcha sin cambiar plantilla:

- **Frontend** runtime config (en `src/components/shared/analytics-ga4.html`):
  - `window.PORTFOLIO_RUNTIME.captcha.provider`: `turnstile`, `recaptcha` o `hcaptcha`
  - `window.PORTFOLIO_RUNTIME.captcha.siteKey`: site key pública
- **Backend** (`netlify/functions/contact.mjs`) por variables de entorno Netlify:
  - `PORTFOLIO_CAPTCHA_PROVIDER` (`turnstile`/`recaptcha`/`hcaptcha`)
  - `PORTFOLIO_CAPTCHA_SECRET` (secret key — nunca commitear)
- **Rate limit** por IP:
  - `PORTFOLIO_RATE_LIMIT_WINDOW_SECONDS` (default `600`)
  - `PORTFOLIO_RATE_LIMIT_MAX_REQUESTS` (default `12`)

Ver rotación de claves y procedimiento completo en `docs/ENGINEERING-RUNBOOK.md`.

---

## CV imprimible

- Página dedicada: `cv-print.html`.
- Los CTAs de CV en home/about abren `cv-print.html#print`.
- Incluye toolbar de pantalla (`Back`, `EN/ES`, `Print CV`) y layout A4 optimizado.

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

Cada push a `main` desencadena:

1. **GitHub Actions `quality.yml`** — build + quality guards.
2. **GitHub Actions `e2e.yml`** — 29 tests Playwright.
3. **Netlify CD** — deploy atómico a CDN (solo si los gates pasan).

Variables de entorno necesarias en Netlify Dashboard: `RESEND_API_KEY`, `FROM_EMAIL`, `TO_EMAIL`, `ALLOWED_ORIGIN`.

---

## Documentación

| Documento | Contenido |
|---|---|
| `AGENTS.md` | Guía para agentes de IA (Claude Code, Copilot, etc.) |
| `docs/ARCHITECTURE.md` | Arquitectura técnica completa |
| `docs/PRD.md` | Requisitos de producto |
| `docs/ROADMAP.md` | Roadmap estratégico |
| `docs/BACKLOG.md` | Backlog detallado con epics y tareas |
| `docs/AI_RULES.md` | Reglas extendidas para agentes IA |
| `docs/SECURITY.md` | Política de seguridad |
| `docs/GLOSSARY.md` | Glosario del proyecto |
| `docs/ENGINEERING-CHANGELOG.md` | Historial técnico completo + ADRs |
| `docs/ENGINEERING-RUNBOOK.md` | Runbook de operaciones |
| `docs/DEPLOY_ROADMAP.md` | Plan y estado de deploy |
| `docs/CASE-STUDY-2026-02-25.md` | Narrativa técnica de caso de estudio |

---

## Siguiente evolución recomendada

1. Performance + A11y Sprint #2: jerarquía de headings, contraste WCAG AA, minificación CSS/JS.
2. Promover CSP de report-only a enforce (Phase 6).
3. Reescribir narrativa de home por impacto (problema → solución → resultado).
4. Google Search Console + sitemap + activación de Turnstile en producción.
