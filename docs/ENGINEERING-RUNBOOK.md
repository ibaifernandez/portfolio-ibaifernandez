# Engineering Runbook

## Objetivo

Guia operativa para mantener calidad, rendimiento y estabilidad del portfolio en local y CI.

## Prerrequisitos

- Node.js 20+
- npm
- Playwright Chromium (`npx playwright install chromium`)
- PHP 7.4+ (solo para smoke real contra `ajax.php`; opcional en entornos de CI donde no este disponible)
- Encoder WebP (`cwebp`) o `ffmpeg` con `libwebp`
- `ripgrep` (`rg`) para `tests/quality-guards.sh` en entornos CI no macOS
- `README.md` versionado y no vacio (validado por `tests/quality-guards.sh`)

Referencia macOS/Homebrew: `brew install webp ffmpeg-full && brew unlink ffmpeg && brew link ffmpeg-full --force`

Nota CI GitHub Actions:

- `quality.yml` instala `ripgrep` via `apt-get` antes de ejecutar `npm run test:quality`.

## Comandos principales

```bash
npm install
npm run build:pages
npm run media:avif
npm run media:webp
npm run media:all
npm run test:templates
npm run test:quality
npm run test:avif
npm run test:webp
npm run test:smoke
npm run playwright:orphans:list
npm run playwright:orphans:kill
npm run test:e2e:clean
npm run test:e2e
npm run test:ci
npm run print:pdf
```

## Presubida (Pre-Deploy) Operativa

Documento fuente de release: `docs/DEPLOY_ROADMAP.md`

Secuencia minima antes de `commit + push`:

```bash
npm run build:pages
npm run test:quality
npm run test:e2e
```

Checks condicionados por entorno:

```bash
npm run test:smoke           # requiere PHP disponible
npm run test:links:external  # requiere red saliente
```

Salida de impresion canonica:

```bash
npm run print:pdf
```

Genera un set de PDFs consistentes en `artifacts/print-pdf/` usando Playwright + `@media print`.

## Higiene del workspace

Limpieza rápida de artefactos temporales/prototipos locales:

```bash
rm -rf sandbox playwright-report test-results
find . -name '.DS_Store' -type f -delete
```

Notas:

- `.gitignore` bloquea `**/.DS_Store`, `playwright-report/`, `test-results/` y `sandbox/`.
- Esta limpieza no altera el build productivo; solo elimina ruido local no funcional.

## Que bloquea el merge

- `test:quality`
  - Sincronía de páginas generadas desde templates (`scripts/build-pages.mjs --check`).
  - Integridad de contenido data-driven (`content/projects.json`, `content/testimonials.json`, `content/training.json`, `content/ctas.json`, `content/services.json`, `content/experience.json`) con required fields.
  - Guardrails de seguridad y HTML.
  - Budget de rendimiento por pagina (`tests/performance-budget.config.json`).
  - Cobertura AVIF/WebP para imagenes grandes (`tests/check-avif-coverage.mjs`, `tests/check-webp-coverage.mjs`).
  - Bloqueo de asset legacy no usado (`assets/images/banner-bg.gif`).
  - Enforzamiento de carga lazy para dependencias no críticas (sin includes estáticos de plugins, `bootstrap.min.js`, `cvtext*.js`).
  - Integridad de enlaces internos/anclas (`tests/check-links.mjs`).
  - Baseline de accesibilidad CSS (`focus-visible`, `prefers-reduced-motion`).
- `test:e2e`
  - Flujo home, idioma, hardening links, anti-spam.
  - Flujo blog shell (render crítico, redes accesibles/hardened, sanity móvil).
  - Navegacion sidebar con anclas validas por seccion.
  - `skip-link` funcional para acceso rapido por teclado.
  - Validacion de fallback AVIF (`<picture>`) en imagen critica.
  - Activacion de cambio de idioma via teclado.
  - Cobertura de foco/teclado en navegación crítica + formulario + redes sociales en index+blog (`tests/e2e/keyboard.spec.js`).
  - Formulario de contacto (feedback accesible en errores, envio valido y cooldown backend).
  - Accesibilidad automatica con axe sobre contacto, secciones primarias del home y shell técnica del blog.
  - Regresion visual de `contact_section`.
  - Estado actual de suite: `29/29` en verde.

## Presupuestos de rendimiento

Archivo fuente: `tests/performance-budget.config.json`

- HTML, CSS, JS e imagenes por pagina (`index.html`, `blog.html`).
- Limites globales por archivo (CSS/JS/imagen).
- Para `<picture>`, el budget contabiliza el recurso preferido (AVIF/WebP) y no suma doble con fallback.
- Estado actual: `index` JS estático ~`135.5 KB`; `blog` JS estático ~`132.9 KB`.

Actualizacion recomendada de budget:

1. Medir impacto real del cambio.
2. Ajustar budget solo si hay justificacion tecnica documentada.
3. Ejecutar `npm run test:quality` y adjuntar resultado en PR.

## Validacion de enlaces

- Internos/anclas (estable, recomendado para CI):

```bash
npm run test:links
```

- Externos HTTP (opcional, puede ser flaky por terceros):

```bash
npm run test:links:external
```

Para observabilidad sin bloquear merges, el repo incluye:

- `.github/workflows/link-health.yml` (job semanal + manual para enlaces externos)

## Media pipeline (AVIF + WebP)

Generar/actualizar assets modernos y aplicar fallback en HTML:

```bash
npm run media:avif
npm run media:webp
npm run media:all
```

Validar cobertura:

```bash
npm run test:avif
npm run test:webp
```

Detalles de implementación:

- `scripts/generate-avif-assets.mjs`: convierte imagenes JPG/JPEG/PNG grandes a AVIF.
- `scripts/generate-webp-assets.mjs`: convierte imagenes JPG/JPEG/PNG grandes a WebP con `cwebp` o `ffmpeg`.
- `scripts/wrap-images-with-avif-picture.mjs`: envuelve `<img>` elegibles en `<picture>`.
- `tests/check-avif-coverage.mjs`: bloquea cambios que dejen imagenes grandes sin fallback AVIF.
- `tests/check-webp-coverage.mjs`: bloquea drift entre assets WebP generados y su `<source>` en HTML.

## Carga Lazy de Plugins

`assets/js/custom.js` carga de forma diferida plugins no críticos:

- `scrollbar.js`
- `jquery.magnific-popup.min.js`
- `swiper.min.js`
- `circle-progress.js`
- `jquery.zoom.js`
- `cvtext1.js` + `cvtext2.js` (solo para animación de texto cuando aplica)

Tambien carga CSS no crítico bajo demanda:

- `assets/css/scrollbar.css`
- `assets/css/swiper.min.css`
- `assets/css/jquery-jvectormap-2.0.3.css`

Esto permite reducir JS inicial y mantener comportamiento equivalente en viewport/uso real.

## Ajustes finos de About (UX visual)

Ultimo ajuste aplicado en `assets/css/style.css`:

- Separacion extra entre la frase de cierre y los CTAs (`.anout_section_btn { margin-top: 12px; }`) para mejorar respiracion visual.
- Frase de firma con contraste fuerte y fondo armonico (`.signature_box .name p`) para reforzar jerarquia del mensaje.
- Panel `Read more` centrado verticalmente dentro de la imagen (`.selfintro_section .left_deatils` con `display:flex` + `justify-content:center`) y `overflow-y:auto` para evitar recortes si el contenido crece.

## Projects simplificada (damero 3x2 + paginas secundarias)

Ultimo ajuste aplicado para `Projects`:

- Se elimina el filtro por categorias en UI.
- Se consolida la seccion en 6 casos con layout damero full-width (3 filas x 2 columnas en desktop, alternancia imagen/texto por fila/columna).
- Se mantiene pipeline data-driven con fuente en `content/projects.json`.
- Cada card de `Finest Work` expone dos superficies navegables hacia su pagina secundaria:
  - imagen (bloque media completo clicable),
  - CTA textual (`Open Project Page`).
- Se habilita generacion automatica de paginas secundarias de proyecto desde `src/pages/project.template.html` (una salida por item de `content/projects.json` via `page.output`).
- Se habilita override por proyecto para plantillas secundarias:
  - `content/projects.json > page.template`
  - fallback automatico a `src/pages/project.template.html` si no hay override.
- Caso actual: DebTracker usa plantilla dedicada `src/pages/project-debtracker.template.html` con:
  - toggle contextual (`Corporate View` / `Spite Driven`) con copy dedicado por modo,
  - tipografia `PT Sans` en modo `Spite Driven`,
  - beacon circular parpadeante sobre el toggle para discovery (persistente, sin auto-dismiss),
  - terminal de logs de seguridad (simulador backend/network Zero-Trust),
  - demo interactiva del Penny-Perfect Protocol (iteracion grafica del centavo remanente),
  - terminal de codigo con Prism.js (comentarios sincronizados con idioma EN/ES).
- Caso actual: GymTracker usa plantilla dedicada `src/pages/project-gymtracker.template.html` con:
  - portada especifica para card+hero (`gymtracker-cover-2.png/.webp`),
  - Data Sovereignty Command Center (metricas/local telemetry simulator),
  - QA Shield Wall animado (`97/97` + bloques por modulo),
  - comparador No Vendor Lock-In (SaaS vs Local-First),
  - bloque de evidencia interna con `gymtracker.png` dentro de la pagina de proyecto.
- Caso actual: Enterprise CRM usa plantilla dedicada `src/pages/project-enterprise-crm.template.html` con:
  - direccion visual vintage newsprint (masthead `Chomsky`, titulares `Playfair`, cuerpo `Libre Baskerville`),
  - CSS dedicado y aislado en `assets/css/lfi-newsprint.css` (no mezcla con `style.css` global),
  - texturas de papel en capa (`texture-newspaper-1/2/3`) + ornamentos (`assets/images/ornaments/*`) con tono desaturado (gris/blanco sucio),
  - cuerpo editorial en doble columna (`column-count: 2; column-gap: 2rem`) para lectura tipo diario,
  - tratamiento de evidencia visual tipo tinta impresa (`grayscale + contrast + sepia + multiply`) para mantener ilusion de papel,
  - variante V4 en full-width con overlay blanco de legibilidad sobre textura,
  - timeline `Trajectory Wire` en sidebar derecha, con eje visual y nodos (look/legibilidad de timeline real),
  - timeline de ascenso (`Aug 2023 -> Jun 2024 -> Dec 2024`) con KPI por etapa en formato de alto contraste,
  - board de sectores convertido a logo-wall real con enlaces corporativos,
  - bloque `Testimonial Ledger` en sidebar derecha, con citas largas y avatares con reveal a color en hover/focus,
  - `Field Evidence Archive` retirado para priorizar narrativa expandida en `The Intrapreneurial Pivot` y `Scale & Cross-Industry Impact`.
- Sidebar de paginas de proyecto unificada con home mediante componente:
  - `src/components/project/sidebar.html` (misma estructura/estetica que home, con anclas hacia `index.html#...`).
- Cierre de paginas de proyecto unificado:
  - `src/components/project/contact-form.html` (mismo formulario de contacto que home),
  - orden estandar: `project content -> contact form -> footer icons/copyright`.
- Ajuste de encuadre DebTracker en grid:
  - selector dedicado `.project_spotlight_img--debtracker` + `object-position: left center`.
- Imagen GymTracker:
  - `assets/images/gymtracker-cover-2.png` optimizada a `1800x1005`,
  - fallback moderno `assets/images/gymtracker-cover-2.webp` integrado en `content/projects.json`,
  - `assets/images/gymtracker.png/.webp` retenida para evidencia interna del dossier.
- Imagen card Enterprise CRM (newspaper variant):
  - `assets/images/lfi-newspaper.jpg` optimizada a `1800x1075`,
  - fallback moderno `assets/images/lfi-newspaper.webp` integrado en `content/projects.json`.
- Se eliminan hooks JS legacy de filtro/popup de portfolio (`isotop_gallery` / `magnific_popup`) para reducir complejidad.
- Se actualizan snapshots de regresion visual al nuevo baseline de layout (`projects-section.png`, `logos-section.png`).

## Workflow data-driven (cards/slides/training/cta)

Archivos fuente de contenido:

- `content/projects.json`
- `content/testimonials.json`
- `content/training.json`
- `content/ctas.json`
- `content/services.json`
- `content/experience.json`

Plantillas de componente:

- `src/components/index/project-card.html`
- `src/pages/project.template.html`
- `src/components/index/testimonial-slide.html`
- `src/components/index/training-item.html`
- `src/components/index/dual-cta-buttons.html`
- `src/components/index/single-cta-button.html`
- `src/components/index/services-group.html`
- `src/components/index/service-card.html`
- `src/components/index/experience-cards/*.html`

Render en `index`:

- `<!-- @render projects-grid -->`
- `<!-- @render testimonials-slides -->`
- `<!-- @render training-timeline -->`
- `<!-- @render hero-cta-buttons -->`
- `<!-- @render about-cta-buttons -->`
- `<!-- @render training-linkedin-cta -->`
- `<!-- @render services-grid -->`
- `<!-- @render experience-rows -->`

Flujo recomendado:

1. Editar datos en `content/*.json`.
2. Ejecutar `npm run build:pages`.
3. Verificar con `npm run test:templates && npm run test:quality && npm run test:e2e`.

## Logos carousel (home)

- Ubicacion actual del bloque: `src/pages/index.template.html` (seccion `port_responsor_setions`).
- Convencion minima por logo:
  - enlace externo endurecido (`target="_blank"` + `rel="noopener noreferrer"`),
  - `img` con `loading="lazy"`, `decoding="async"` y `alt` explicito.
- Cambio reciente:
  - agregado `Bill Capital` con enlace a `http://billcapital.com/`,
  - agregado `Norden` (`https://clinicasnorden.cl/`) y `Clinica Costanera` (`https://ccostanera.cl/`) al swiper principal,
  - asset optimizado a `240x250` para reducir peso en `index.html`.

## Regresion visual

Si un cambio visual es intencionado:

```bash
npx playwright test tests/e2e/visual.spec.js --update-snapshots
```

Luego ejecutar:

```bash
npm run test:e2e
```

Cobertura actual de snapshots:

- `contact-section.png`
- `experience-section.png`
- `projects-section.png`
- `logos-section.png`

Nota DebTracker: tras cambios de imagen/copy en la card del grid, actualizar `projects-section.png` con `--update-snapshots` y revalidar suite completa.

## Playwright huérfano (terminales colgadas)

Se reemplaza el protocolo manual por un script versionado porque los nombres de proceso cambian entre versiones de Playwright/Chromium y el patrón anterior se quedó corto.

Diagnóstico:

```bash
npm run playwright:orphans:list
```

Limpieza:

```bash
npm run playwright:orphans:kill
```

Ejecución E2E con limpieza automática antes/después:

```bash
npm run test:e2e:clean
```

Notas operativas:

1. El script detecta candidatos por firmas actuales (`playwright_chromiumdev_profile`, `ms-playwright`, `chrome-headless-shell`, `headless_shell`, `playwright-core`).
2. Si la UI muestra terminales pero `playwright:orphans:list` no devuelve procesos, son sesiones colgadas del editor y se pueden cerrar sin riesgo con `Stop` o reiniciando la app.
3. No usar patrones globales tipo `killall chrome`, porque pueden cerrar navegadores ajenos al test.

## Incidente documentado (layout)

- Historial consolidado en `docs/ENGINEERING-CHANGELOG.md` (seccion de incidentes/regresiones y mitigaciones).

## Politica de cambios drásticos

- Mantener comportamiento funcional existente.
- Introducir cambios arquitectonicos en sprints pequeños y reversibles.
- No tocar deploy productivo hasta cerrar baseline local + CI.
- Blog Lorem Ipsum: pendiente deliberado en backlog.

## Narrativa publicable (GitHub/LinkedIn)

- `docs/CASE-STUDY-2026-02-25.md`: versión resumida y publicable.
- `docs/ENGINEERING-CHANGELOG.md`: historial técnico consolidado (`que/como/por que`) de todas las fases.
