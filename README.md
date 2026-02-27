# Portfolio Ibai Fernandez

Portfolio estatico personal orientado a mostrar experiencia en Front-End, marketing y contenido.

## Stack actual

- HTML + CSS + JavaScript (jQuery + plugins de plantilla)
- PHP simple para formulario de contacto (`ajax.php`)
- Despliegue por cPanel (`.cpanel.yml`)

## Ejecutar en local

Requiere PHP 8+ (o 7.4+).

```bash
php -S 127.0.0.1:4173 -t .
```

Abrir: `http://127.0.0.1:4173/index.html`

## Calidad y testing

Se incluyen pruebas sin dependencias externas:

```bash
bash tests/quality-guards.sh
bash tests/smoke.sh
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

Build de páginas desde templates/componentes:

```bash
npm run build:pages
npm run test:templates
```

Contenido data-driven de cards/slides:

- `content/projects.json`
- `content/testimonials.json`
- `content/training.json`
- `content/ctas.json`

Optimizacion de imagenes (AVIF/WebP + fallback):

```bash
npm run media:all
```

### Que valida cada script

- `tests/quality-guards.sh`
  - No uso de `eval(` en JS de formulario.
  - No enlaces con `href=""` ni `href="javascript:;"`.
  - No `target="_blank"` sin `rel="noopener noreferrer"`.
  - No URL claramente rota (`https://https://...`).
  - Presencia de headers de seguridad clave en `.htaccess`.
  - Presencia de campos anti-spam (`website`, `form_started_at`, `captcha_provider`, `captcha_token`) y su validación backend.
  - Presencia de `skip-link` de teclado a contenido principal.
  - Presencia de contenedor de estado accesible del formulario (`aria-live`).
  - Validación de carga lazy en dependencias no críticas (sin script tags estáticos en `index.html` y `blog.html`, incluyendo `bootstrap.min.js` y `cvtext*.js`).
  - Todas las imagenes en `index.html` y `blog.html` tienen `loading`, `width` y `height`.
  - Presupuesto de rendimiento por página y por tipo de asset.
  - Cobertura AVIF y WebP en imagenes grandes (fallback real con `<picture>`).
  - Validacion de render data-driven (si falta un campo requerido en `content/*.json`, el build falla).
  - Checker de enlaces rotos internos/anclas.
  - Baseline de accesibilidad en CSS (`focus-visible` + `prefers-reduced-motion`).
- `tests/smoke.sh`
  - El sitio levanta por HTTP local.
  - `index.html` responde y contiene marcadores clave.
  - `ajax.php` no acepta peticiones invalidas basicas.
- `tests/e2e/home.spec.js`
  - Render del home y bloques criticos.
  - Sidebar con anclas reales a secciones del documento.
  - `skip-link` funcional para navegación por teclado.
  - Primer `Tab` cae en `skip-link`.
  - Validacion de `picture/source` AVIF/WebP en imagen critica de perfil.
  - Cambio de idioma y `lang` del documento.
  - Activacion por teclado del selector de idioma.
  - Hardening de enlaces `target="_blank"`.
  - CTA de contacto y ancla a seccion.
  - Presencia de guardas anti-spam del formulario.
- `tests/e2e/contact.spec.js`
  - Feedback accesible cuando faltan campos requeridos.
  - Feedback accesible para email inválido (`aria-invalid` + alerta).
  - Envio valido del formulario de contacto.
  - Enforzamiento de cooldown backend para envios consecutivos.

## Anti-spam avanzado (rollout controlado)

El formulario mantiene el flujo actual por defecto y permite activar captcha sin cambiar plantilla:

- Frontend runtime config (en `src/components/shared/analytics-ga4.html`):
  - `window.PORTFOLIO_RUNTIME.captcha.provider`: `turnstile`, `recaptcha` o `hcaptcha`
  - `window.PORTFOLIO_RUNTIME.captcha.siteKey`: site key publica
- Backend (`ajax.php`) por variables de entorno:
  - `PORTFOLIO_CAPTCHA_PROVIDER` (`turnstile`/`recaptcha`/`hcaptcha`)
  - `PORTFOLIO_CAPTCHA_SECRET` (secret key)
  - opcional `PORTFOLIO_CAPTCHA_MIN_SCORE` (solo si usas flujo por score de reCAPTCHA)
- Rate limit por IP (backend):
  - `PORTFOLIO_RATE_LIMIT_WINDOW_SECONDS` (default `600`)
  - `PORTFOLIO_RATE_LIMIT_MAX_REQUESTS` (default `12`)

## CV imprimible

- Nueva pagina dedicada: `cv-print.html`.
- Los CTAs de CV en home/about abren `cv-print.html#print` (en lugar de PDF remoto).
- La pagina incluye toolbar de pantalla (`Back`, `EN/ES`, `Print CV`) y layout A4 optimizado para impresion.
- `tests/e2e/a11y.spec.js`
  - Validacion de accesibilidad automatica (axe) sin violaciones `serious/critical` en contacto, secciones primarias del home y shell técnica del blog.
- `tests/e2e/visual.spec.js`
  - Regresion visual de referencia para `contact_section`.
- `tests/e2e/keyboard.spec.js`
  - Orden de tab para navegación crítica (`skip-link` + sidebar anchors).
  - Activación por teclado de anchors de sidebar y reachability del botón de idioma.
  - Orden de tab lógico en formulario de contacto.
  - Reachability por teclado de enlaces sociales del sidebar + verificación de `aria-label` en index y blog.
- `tests/e2e/blog.spec.js`
  - Render crítico de `blog.html`.
  - Hardening + accesibilidad de redes sociales del sidebar.
  - Verificación de no overflow horizontal en viewport móvil.

## Presupuesto de rendimiento

- Config: `tests/performance-budget.config.json`
- Runner: `tests/check-performance-budget.mjs`
- Comando dedicado:

```bash
npm run test:budget
```

Nota: para bloques `<picture>`, el budget cuenta el asset preferido (AVIF/WebP si existe) y evita doble conteo con el fallback.

## Pipeline de medios

- Conversión: `scripts/generate-avif-assets.mjs`
- Conversión: `scripts/generate-webp-assets.mjs`
- Mapeo HTML fallback: `scripts/wrap-images-with-avif-picture.mjs`
- Guardrails de cobertura: `tests/check-avif-coverage.mjs`, `tests/check-webp-coverage.mjs`

Comandos:

```bash
npm run media:avif
npm run media:webp
npm run media:all
npm run test:avif
npm run test:webp
```

Prerequisito WebP: tener disponible `cwebp` o `ffmpeg` con encoder `libwebp`.

Estado actual:

- 28 imágenes principales en `index.html` + 1 en `blog.html` servidas con `<picture>` AVIF/WebP y fallback a original.
- PNG con alpha se excluyen automáticamente para evitar regresión visual.
- Cobertura validada: `29` imágenes con fuente AVIF y `29` con fuente WebP (1 caso omitido en WebP por no mejorar peso).

## Link checker

- Runner: `tests/check-links.mjs`
- Comandos:

```bash
npm run test:links
npm run test:links:external
```

`test:links` valida enlaces internos y anclas locales.
`test:links:external` añade validación HTTP externa (puede depender de conectividad y respuesta de terceros).

Adicionalmente existe un workflow programado para salud de enlaces externos:

- `.github/workflows/link-health.yml` (lunes 09:00 UTC + ejecución manual)

## Servidor local para E2E

Playwright usa `scripts/static-server.mjs` para levantar el sitio sin depender de PHP.
Si quieres iniciar ese servidor manualmente:

```bash
npm run start
```

## Mejoras recientes (UX/A11y)

- Navegacion lateral con anclas semanticas (`#about_sec`, `#training_sec`, `#project_sec`, `#contact_sec`).
- Scroll activo calculado por secciones reales (`.page_scroll[data-scroll]`) para evitar desajustes.
- `prefers-reduced-motion` aplicado tanto en CSS como en comportamiento JS.
- Formulario con feedback accesible (`aria-live`, `aria-invalid`, estados visuales y microcopy más claro).
- `skip-link` para salto directo al contenido principal desde teclado.
- `skip-link` también incorporado en `blog.html` (`#blog_main`).
- Pipeline AVIF con fallback semántico en HTML y validación en quality gates.
- Pipeline WebP integrado con fallback y guardrail de cobertura.
- Carga de `jvectormap` bajo demanda (ya no forma parte del JS inicial de `index.html`).
- Carga bajo demanda de plugins no críticos (`isotope`, `magnific`, `swiper`, `circle-progress`, `zoom`, `scrollbar`).
- Carga bajo demanda de CSS no crítico de plugins (`magnific`, `swiper`, `jvectormap`, `scrollbar`) para reducir bloqueo de render.
- Eliminadas dependencias JS legacy del arranque (`bootstrap.min.js`, `cvtext1.js`, `cvtext2.js`) con inicialización lazy cuando aplica.
- Base CSS con design tokens (`:root`) para acelerar componentización segura.
- Componentización fase 2: proyectos/testimonios generados desde `content/*.json` + `@render`.
- Componentización fase 3: training timeline generado desde `content/training.json` + `@render training-timeline`.
- Componentización fase 4: CTAs de hero/about/training generados desde `content/ctas.json` + `@render`.
- Cobertura E2E ampliada para teclado/focus order en navegación crítica.
- Hardening de contraste y labels accesibles completado para Home/Contact con baseline axe en verde.
- Hardening de accesibilidad técnica del blog (social links accesibles/hardened + `blog_searchicon` con nombre accesible + baseline axe de shell técnica en verde).
- Suite E2E actual en verde: `27/27`.

## Estado de auditoria

Ver detalle completo en:

- `docs/AUDIT-2026-02-25.md`
- `docs/ENGINEERING-RUNBOOK.md`
- `docs/adr/ADR-001-componentization-strategy.md`
- `docs/adr/ADR-002-design-tokens-and-css-governance.md`
- `docs/CASE-STUDY-2026-02-25.md` (narrativa técnica: qué/cómo/por qué + impacto)
- `docs/COMPONENTIZATION-PHASE-1-2026-02-25.md` (workflow técnico de templates + parciales)
- `docs/COMPONENTIZATION-PHASE-2-2026-02-25.md` (cards/slides data-driven)
- `docs/COMPONENTIZATION-PHASE-3-2026-02-25.md` (training timeline data-driven)
- `docs/COMPONENTIZATION-PHASE-4-2026-02-25.md` (CTA data-driven)
- `docs/PERFORMANCE-HARDENING-PHASE-5-2026-02-25.md` (auditoría de dependencias JS/CSS + carga lazy por prioridad)
- `docs/ACCESSIBILITY-HARDENING-PHASE-4-2026-02-25.md` (cierre de contrastes críticos + semántica icon-only)

## Siguiente evolucion recomendada

1. Resolver contenido placeholder del blog (pendiente deliberado en backlog).
2. Reescribir narrativa de home por impacto (problema -> solucion -> resultado) y reforzar SEO semantico.
3. Normalizar traducciones ES/EN y metadatos bilingües.
4. Evolucionar el bridge actual hacia framework estatico (ADR-001) cuando cierre la migracion de contenido.
