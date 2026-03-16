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
npm run build:pages    # genera index.html, cv-print.html, dossiers HTML públicos y assets .min derivados
```

> Los archivos `*.html` en la raíz son GENERADOS. No los edites directamente.
> Los assets versionados `assets/css/*.min.css` y `assets/js/*.min.js` también son GENERADOS por `npm run build:pages`.
> Edita `src/pages/*.template.html` y `src/components/**/*.html`, luego ejecuta el build.
> Para cambiar CSS/JS servido en producción, edita las fuentes legibles (`assets/css/*.css`, `assets/js/*.js`) y vuelve a generar.

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
npm run media:all      # genera assets modernos para todas las páginas HTML del root y recompila
npm run test:avif      # valida cobertura AVIF
npm run test:webp      # valida cobertura WebP
```

Estado actual: la cobertura AVIF/WebP ya se valida sobre todas las páginas generadas del root (`index`, `cv-print` y dossiers públicos) y no quedan faltantes de WebP en los quality guards.

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
- `a11y.spec.js` — Axe sin violaciones `serious/critical` en Home y Contact.
- `norden-translation.spec.js` — Traducción EN/ES del dossier Norden vía `?lang=`.
- `visual.spec.js` — Regresión visual de referencia para secciones clave.

Nota de producto: el portfolio ya no tiene blog público. La ruta heredada `/blog` / `/blog.html` redirige al home y los proyectos son la única superficie editorial pública.

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

Cada push a `main` desencadena un único workflow:

1. **GitHub Actions `ci.yml`** — install + build + quality guards + Playwright + deploy a Netlify (solo si todo pasa).

Variables de entorno necesarias en Netlify Dashboard: `RESEND_API_KEY`, `FROM_EMAIL`, `TO_EMAIL`. Opcionales para captcha: `PORTFOLIO_CAPTCHA_PROVIDER`, `PORTFOLIO_CAPTCHA_SECRET`, `PORTFOLIO_CAPTCHA_MIN_SCORE`.

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
| `docs/PARALLEL-SAFETY-BASELINE.md` | Contrato mecánico compartido para trabajo paralelo seguro |
| `docs/THREAD-ORCHESTRATION.md` | Modelo de trabajo en 13 hilos + ownership de archivos |
| `docs/DEPLOY_ROADMAP.md` | Plan y estado de deploy |
| `docs/CASE-STUDY-2026-02-25.md` | Narrativa técnica de caso de estudio |

Los prompts maestros para trabajar cada hilo por separado viven en `docs/THREAD-PROMPTS/`.

---

## Siguiente evolución recomendada

1. Re-capturar PageSpeed post-accesibilidad + minificación + media y comparar contra la baseline del 2026-03-03.
2. Promover CSP de report-only a enforce (Phase 6).
3. Reescribir narrativa de home por impacto (problema → solución → resultado).
4. Google Search Console + sitemap + validación real de Turnstile en producción.
