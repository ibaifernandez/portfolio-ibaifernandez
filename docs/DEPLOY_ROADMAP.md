# Backlog Operativo de Pre-Release y Release

## 1) Objetivo

Este documento es el backlog operativo para llevar `portfolio-ibaifernandez` a release de produccion sin regresiones.
No es una lista suelta de ideas: cada item indica estado, por que existe, como se ejecuta y como se valida.

Ultima actualizacion: `2026-02-27`.

## 2) Como leer este documento

1. `Backlog de pre-release`: trabajo tecnico que deja el producto listo para salir.
2. `Backlog de release`: tareas de salida a produccion y verificacion final.
3. Cada item tiene 5 campos obligatorios: estado, por que, como, validacion y cierre.

## 3) Estados

- `DONE`: implementado y validado.
- `PENDING`: pendiente de implementar.
- `IN_PROGRESS`: en implementacion o validacion parcial.
- `MANUAL`: requiere accion humana fuera del repo/pipeline.

## 4) Foto actual (resumen ejecutivo)

- Pipeline CI `quality-and-e2e`: en verde.
- Build/data sync/guardrails/performance/a11y/e2e: en verde.
- Descubrimiento base: activo (`canonical`, Open Graph, Twitter, `robots.txt`, `sitemap.xml`, `llms.txt`, `llms-full.txt`).
- Schema estructurado JSON-LD: activo en home, blog y project pages.
- Analitica: base cross-page + eventos clave de CTA/formulario activos.
- Formulario: anti-spam avanzado activo (rate limit por IP + Cloudflare Turnstile en frontend/backend).
- Secretos: se removio secret hardcodeado del repo; carga por env/archivo local no versionado.
- CV imprimible: pagina dedicada `cv-print.html` enlazada desde CTAs de CV (sin PDF externo).
- Pendiente de release final: CSP en modo enforce, verificacion de buscadores, QA manual en produccion.

## 5) Backlog de pre-release

| ID | Estado | Tema | Por que | Como se resuelve | Validacion |
|---|---|---|---|---|---|
| PR-01 | DONE | Gate tecnico base | Evitar regresiones antes de push | `build:pages`, `test:quality`, `test:e2e`, `test:smoke` (si hay PHP) | CI/local en verde |
| PR-02 | DONE | Optimizacion de carga | Reducir tiempos y peso | AVIF/WebP, lazy-load de recursos no criticos, budgets | `test:quality` + budgets OK |
| PR-03 | DONE | Deploy acotado | Evitar subir artefactos no publicos | `.cpanel.yml` copia solo artefactos publicos | revision de `.cpanel.yml` |
| PR-04 | DONE | Discovery base por pagina | Mejora indexacion y social previews | canonical + OG + Twitter en templates | inspeccion HTML + CI |
| PR-05 | DONE | Discovery LLM | Facilitar descubrimiento por modelos | `llms.txt` + `llms-full.txt` | endpoints accesibles |
| PR-06 | DONE | Schema estructurado | Mejor interpretacion semantica en buscadores | JSON-LD en home/blog/projects, generado de forma determinista en build | inspeccion HTML generado |
| PR-07 | DONE | Analitica base cross-page | Tener medicion unificada | componente GA4 compartido en todas las paginas | presencia de tag en HTML |
| PR-08 | DONE | Eventos clave de analitica | Medir conversion real, no solo pageviews | instrumentados eventos de CTA, submit (attempt/success/failure) y cambio de idioma | `build:pages` + `test:quality` + `test:e2e` OK |
| PR-09 | DONE | Anti-spam base formulario | Frenar bots triviales | honeypot + tiempo minimo + cooldown por sesion | smoke/e2e de formulario |
| PR-10 | DONE | Anti-spam avanzado | Capa adicional ante abuso real | rate limit por IP + Cloudflare Turnstile integrado (frontend runtime + backend verify) | `build:pages` + `test:quality` + `test:e2e` OK |
| PR-11 | IN_PROGRESS | CSP madura | endurecer seguridad de contenido | pasar de Report-Only a Enforce tras ventana de observacion | sin bloqueos legitimos en produccion |
| PR-12 | DONE | Chequeo externo de enlaces | evitar links rotos de terceros | se eliminaron enlaces muertos y se reforzo el checker con fallback `HEAD -> GET` | `npm run test:links:external` OK |
| PR-13 | IN_PROGRESS | QA Desktop v1.0 | cerrar calidad manual de release | checklist ya definido; falta pasada final en produccion | acta QA firmada |
| PR-14 | IN_PROGRESS | QA Mobile v1.0 | asegurar UX real en moviles | checklist ya definido; falta pasada final en produccion | acta QA firmada |

## 6) Backlog de release (dia de salida)

| ID | Estado | Tema | Responsable | Como se resuelve | Criterio de cierre |
|---|---|---|---|---|---|
| RL-01 | MANUAL | Verificar propiedad en Google | Owner | alta/verificacion en Search Console | propiedad verificada |
| RL-02 | MANUAL | Verificar propiedad en Bing | Owner | alta/verificacion en Bing Webmaster | propiedad verificada |
| RL-03 | MANUAL | Envio de sitemap | Owner | enviar `sitemap.xml` en ambos paneles | sitemap aceptado |
| RL-04 | PENDING | Tag de release | Codex + Owner | crear tag estable pre-release/release | tag publicado |
| RL-05 | IN_PROGRESS | QA final en produccion | Owner | ejecutar checklists Desktop/Mobile en URL real | checklist completo |
| RL-06 | PENDING | Validacion de tracking en vivo | Owner | comprobar eventos/pageviews en tiempo real | eventos visibles |
| RL-07 | PENDING | Activar CSP Enforce | Codex | cambiar header y desplegar | sitio estable sin bloqueos legitimos |
| RL-08 | MANUAL | Rotacion y custodia de secreto Turnstile | Owner | rotar secret en Cloudflare y guardarlo fuera de git (`PORTFOLIO_SECRET_FILE`) | secreto nuevo operativo y no expuesto |

## 7) QA Desktop v1.0 (checklist ejecutable)

### UI/Layout

1. Sidebar consistente entre home y project pages.
2. Tarjetas de proyectos: imagen y CTA navegan correctamente.
3. Cambio de idioma consistente en bloques dinamicos.
4. Footer/contacto consistente en project pages.

### Funcional

1. Formulario: validacion y envio valido.
2. Navegacion Prev/Next/All Projects operativa.
3. Modulos interactivos de DebTracker/GymTracker/National estables.

### Accesibilidad

1. Skip-link como primer foco.
2. Recorrido de teclado completo en nav, social y formulario.
3. Sin errores graves/criticos en validacion automatica.

### Performance

1. Budgets de calidad en verde.
2. Cobertura AVIF/WebP en verde.
3. Sin regresion en paginas pesadas.

### Discovery

1. Canonical unico y correcto por pagina.
2. OG/Twitter coherentes por pagina.
3. JSON-LD presente y valido por tipo de pagina.
4. `robots`, `sitemap`, `llms` accesibles.

## 8) QA Mobile v1.0 (checklist ejecutable)

### UI/Layout

1. Sin overflow horizontal en 360px y 390px.
2. Legibilidad correcta en proyectos (hero, copy, media, nav).
3. Formulario usable completo en teclado movil.
4. Cambio de idioma sin colisiones visuales.

### Funcional

1. Anclas de navegacion llevan a la seccion correcta.
2. Imagen/CTA de tarjetas de proyecto navegan correctamente.
3. Interactivos clave funcionan con touch.

### Accesibilidad

1. Indicadores de foco visibles (donde aplique).
2. Tap targets adecuados y sin solapes.
3. Sin errores graves/criticos en rutas clave.

### Performance

1. LCP/CLS razonables en perfil movil.
2. Sin saltos de layout relevantes al cargar recursos.

### Discovery

1. Metadatos equivalentes a desktop en source.
2. Endpoints de discovery accesibles en produccion.

## 9) Plan de ejecucion recomendado (orden)

1. Cerrar buildout de paginas de proyecto pendientes.
2. Ejecutar QA manual Desktop/Mobile en produccion (`PR-13`, `PR-14`).
3. Completar tareas manuales de buscadores (`RL-01`, `RL-02`, `RL-03`).
4. Cambiar CSP a Enforce (`PR-11`/`RL-07`) solo con evidencia de estabilidad.
5. Cerrar release con tag y validacion final de tracking (`RL-04`, `RL-06`).

## 10) CSP: paso de Report-Only a Enforce

### Cuando hacerlo

- Despues de terminar el buildout de paginas.
- Despues de congelar analitica y formulario (para no reabrir allowlists cada dia).

### Procedimiento

1. Mantener Report-Only durante ventana de observacion.
2. Recopilar violaciones legitimas.
3. Ajustar allowlist minimamente.
4. Cambiar a `Content-Security-Policy` (modo enforce).
5. Ejecutar gate completo y QA rapido en produccion.

### Reversa

Si algo legitimo se rompe, volver temporalmente a Report-Only, corregir politica y reintentar.

## 11) Matriz de responsabilidades

### Codex

1. Implementaciones en codigo/templates.
2. Automatizacion de build/tests y hardening tecnico.
3. Documentacion tecnica y actualizacion de este roadmap.

### Owner

1. Verificaciones en paneles de buscadores.
2. QA manual final en produccion.
3. Decision final de release.

## 12) Resuelto recientemente (que y como)

1. Deploy acotado por artefactos:
   - ajustado `.cpanel.yml` para no copiar repo completo.
2. Discovery base:
   - `robots.txt`, `sitemap.xml`, `llms.txt`, `llms-full.txt` publicados.
3. Metadatos sociales/SEO:
   - canonical + OG + Twitter homogenizados por plantilla.
4. Schema JSON-LD:
   - `index`: `WebSite + Person + WebPage`.
   - `blog`: `WebSite + Person + CollectionPage`.
   - proyectos: `WebSite + Person + WebPage + CreativeWork`.
   - generacion automatica por build en `scripts/build-pages.mjs` con `pageStructuredDataJson` para evitar drift.
5. Estabilidad de CI:
   - smoke hardenizado y visual snapshot estabilizado.
6. Eventos de analitica:
   - `assets/js/custom.js`: eventos `cta_click`, `contact_submit_attempt`, `contact_submit_success`, `contact_submit_failure`, `contact_submit_blocked`.
   - `assets/js/translate.js`: evento `language_change`.
7. Anti-spam avanzado (base tecnica):
   - `ajax.php`: rate limit por IP con storage local (`artifacts/contact-rate-limit.json`), sin romper cooldown por sesion.
   - `ajax.php`: verificacion captcha backend activable via env (`PORTFOLIO_CAPTCHA_PROVIDER`, `PORTFOLIO_CAPTCHA_SECRET`, opcional `PORTFOLIO_CAPTCHA_MIN_SCORE`).
   - `ajax.php`: carga segura de credenciales desde `PORTFOLIO_SECRET_FILE` o `config/secrets.local.php` (gitignored).
   - `assets/js/custom.js`: soporte de widget captcha (Turnstile/reCAPTCHA/hCaptcha) activable por runtime config.
   - `src/components/shared/analytics-ga4.html`: runtime config central (`window.PORTFOLIO_RUNTIME.captcha`).
8. Guardrails de calidad:
   - `tests/quality-guards.sh` valida campos captcha, eventos GA4 del formulario y bloqueo de secretos hardcodeados en `.htaccess`.
9. Normalizacion de enlaces sociales:
   - LinkedIn consolidado a `https://linkedin.com/in/ibaifernandez`.
   - WhatsApp normalizado a formato valido `https://wa.me/573224288532`.
10. Eliminacion de codigo muerto visible:
   - retirados del carrusel de marcas los dominios `chankete.com` y `chokilate.aglaya.biz`.
11. CV imprimible operativo:
   - nueva pagina `cv-print.html` con layout dedicado para impresion y trigger de `window.print()`.
   - CTAs de CV ahora apuntan a `cv-print.html#print` en lugar de PDF externo.
12. Estado actual de `test:links:external`:
   - resultado en verde tras hardening del checker externo (`HEAD -> GET` fallback).

## 13) Comandos de gate

```bash
npm run build:pages
npm run test:quality
npm run test:e2e
npm run test:smoke            # requiere PHP
npm run test:links:external   # requiere red
```

Regla operativa: no cerrar release si falla cualquier gate no opcional.

## 14) Siguiente paso inmediato (ahora)

Objetivo de esta iteracion: preparar cierre de release con validacion manual final.

1. Ejecutar QA manual completo Desktop + Mobile en produccion.
2. Confirmar eventos en GA4 Realtime (CTA, formulario, language toggle).
3. Verificar propiedad en GSC/Bing y enviar `sitemap.xml`.
4. Rotar secret de Turnstile y provisionarlo fuera de git.
5. Con evidencias en mano, mover CSP a Enforce y cerrar release.
