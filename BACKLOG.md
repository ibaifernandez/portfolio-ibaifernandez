# BACKLOG - Portfolio Ibai Fernandez

Objetivo: convertir este portafolio en una referencia profesional de producto, ingeniería y experiencia de usuario sin romper el comportamiento actual en producción.

## Visión y criterios de excelencia

Definición de "state-of-the-art" para este proyecto:

- Rendimiento superior en móvil y desktop.
- Accesibilidad real (WCAG 2.2 AA en flujos clave).
- Código mantenible y modular, con deuda técnica controlada.
- Testing robusto (quality gates + E2E + regresión visual).
- Observabilidad básica y despliegue predecible.
- Narrativa profesional y contenido impecable.

## North-star metrics (metas)

- Lighthouse Performance >= 95 (Home, móvil).
- Lighthouse Accessibility >= 95.
- CLS <= 0.05.
- LCP <= 2.2s (móvil 4G simulada).
- JS inicial <= 220KB gzip (objetivo evolutivo).
- CSS inicial <= 120KB gzip (objetivo evolutivo).
- Cobertura E2E crítica >= 90% de journeys definidos.
- 0 enlaces rotos en pages públicas.

## Reglas del roadmap

- No romper comportamiento visible del portfolio actual.
- Cambios drásticos se hacen por sprints pequeños y reversibles.
- Cada sprint deja entregables verificables y métricas.
- Si un cambio requiere migración, coexistencia temporal (legacy + nuevo).

## Epics (priorizadas)

### EPIC A - Fundación de calidad y seguridad (P0)

Estado: Completado

- [x] Endurecer `ajax.php` (validación/sanitización server-side).
- [x] Eliminar `eval` en validaciones frontend.
- [x] Endurecer `target="_blank"` con `rel="noopener noreferrer"`.
- [x] Guardrails de calidad (`tests/quality-guards.sh`).
- [x] Añadir headers HTTP de seguridad en `.htaccess`.
- [x] Preparar rate-limit básico / anti-spam de contacto (honeypot + cooldown).
- [x] Definir política de CSP progresiva (report-only -> enforce).

Criterio de aceptación:

- Sin hallazgos críticos de seguridad obvios en formulario y navegación.
- Quality gates verdes de forma estable.

### EPIC B - Performance y media pipeline (P0)

Estado: Completado

- [x] `loading/width/height` en todas las imágenes de `index` y `blog`.
- [x] Script de enriquecimiento automático de imágenes.
- [x] Definir budget de peso por página y bloqueo en CI si se excede.
- [x] Lazy-init del `world-map` con `IntersectionObserver` para diferir coste inicial.
- [x] Convertir imágenes principales a AVIF con fallback (`<picture>`) y validación automática de cobertura.
- [x] Completar variante WebP cuando el entorno tenga encoder (`cwebp` o `sharp`) disponible.
- [x] Eliminar assets muertos/no usados (`banner-bg.gif` retirado + `bootstrap.min.js` eliminado del repo y bloqueado en guardrails).
- [x] Revisar carga de librerías legacy no críticas y diferir/cargar bajo demanda (`jvectormap`, `isotope`, `magnific`, `swiper`, `circle-progress`, `zoom`, `scrollbar`, `cvtext*`) + retiro de `bootstrap.min.js` estático.

Criterio de aceptación:

- Mejora medible en LCP/CLS/TBT.
- Presupuesto de assets versionado y monitoreado.

### EPIC C - Componentización y arquitectura (P0)

Estado: Completado

Objetivo: extraer el monolito HTML a arquitectura modular sin perder look&feel.

- [x] ADR-001: Decidir estrategia (Astro vs Vite + Nunjucks/partials).
- [x] Crear design tokens (tipografía, spacing, color, shadows) y variables centralizadas.
- [x] Extraer componentes: navbar lateral, hero, cards de proyecto, testimonios, footer, CTA. (Fase 1 + Fase 2 + Fase 3 + Fase 4: sidebar + hero + footer + translate button + ProjectCard/TestimonialCard + training timeline + CTA data-driven)
- [x] Separar data de contenido (`projects`, `training`, `testimonials`) en JSON/MD.
- [x] Mantener salida estática compatible con hosting actual durante transición.

Criterio de aceptación:

- `index.html` deja de ser archivo monolítico difícil de evolucionar.
- Nuevas secciones se agregan cambiando data, no copiando bloques gigantes.

### EPIC D - Testing profesional y CI/CD (P0)

Estado: Completado

- [x] Base Playwright + config + workflow CI.
- [x] Ejecutar instalación real en entorno con red (`npm install`, `playwright install`).
- [x] Green baseline de E2E en entorno real.
- [x] Añadir pruebas de regresión visual en vistas clave.
- [x] Añadir pruebas de accesibilidad automáticas (axe/playwright).
- [x] Publicar artefactos (reportes, screenshots) en CI.

Criterio de aceptación:

- Pipeline CI confiable y repetible.
- Cambios UI críticos detectan regresiones antes de deploy.

### EPIC E - Accesibilidad y UX avanzada (P1)

Estado: Completado (scope técnico pre-copy)

- [x] Auditoría completa de teclado/focus order. (cobertura E2E en index+blog: `skip-link`, sidebar, formulario, redes y activación por teclado)
- [x] Aria labels/roles consistentes en icon-only controls.
- [x] Contrastes y escalado tipográfico revisados en scope técnico actual. (Home/Contact + shell técnica de Blog en verde para `serious/critical`)
- [x] Motion/accessibility (respeto `prefers-reduced-motion`).
- [x] Estados accesibles de formulario (errores/success con `aria-live`, `aria-invalid`, microcopy claro).
- [x] Navegación con `skip-link` para salto directo a contenido principal.
- [ ] Mejora de microcopy en CTAs. (migrado a trabajo de contenido)

Criterio de aceptación:

- Cumplimiento WCAG 2.2 AA en journeys clave.

### EPIC F - Contenido y narrativa profesional (P1)

Estado: Pendiente

- [ ] Reescritura editorial de home (propuesta de valor, diferenciadores, casos).
- [ ] Curar portfolio con enfoque outcomes/impacto y no solo entregables.
- [ ] Normalizar idioma (ES/EN) y estrategia de traducción (texto, metadata).
- [ ] SEO on-page avanzado (schema, metadata por sección, OG coherente).
- [ ] **Resolver bloque blog placeholder/lorem ipsum** (se deja pendiente deliberadamente por ahora).

Criterio de aceptación:

- El portfolio comunica seniority y criterio en < 60 segundos.

### EPIC G - Observabilidad y operación (P2)

Estado: Pendiente (post-MVP, no bloqueante para primer final técnico)

- Error tracking frontend (Sentry o similar). (post-MVP)
- Analytics de eventos clave (CTA, contacto, idioma). (post-MVP)
- Dashboard mínimo de salud (Core Web Vitals + funnels). (post-MVP)
- Checklist de release y post-release. (post-MVP)

Criterio de aceptación:

- Se detectan problemas reales de usuario rápidamente.

## Sprint roadmap sugerido (8 sprints)

### Sprint 0 - Baseline duro (1 semana)

- Correr Lighthouse + WebPageTest baseline y registrar métricas.
- Ejecutar Playwright en entorno real y fijar baseline.
- Cerrar gaps de setup (dependencias, scripts, docs de ejecución).

### Sprint 1 - Seguridad + HTTP hardening (1 semana)

- Headers en `.htaccess`.
- Honeypot/cooldown formulario.
- Primera versión CSP report-only.

### Sprint 2 - Media pipeline (1-2 semanas)

- Conversión masiva a WebP/AVIF + fallback.
- Automatización de optimización y validación en CI.
- Remoción de assets muertos.

### Sprint 3 - Componentización Fase 1 (1-2 semanas)

- Setup de arquitectura modular.
- Migración de hero/nav/footer como componentes.
- Mantener output estático funcional.

### Sprint 4 - Componentización Fase 2/3/4 (1-2 semanas)

- Migración de proyectos/testimonios/training/CTA a data-driven. (completado)
- Reducción significativa de duplicación HTML y hardcodes de botones.

### Sprint 5 - Testing avanzado (1 semana)

- E2E cobertura crítica completa.
- Regresión visual y a11y automation.

### Sprint 6 - UX + A11y (1 semana)

- Refinamiento navegación, focos, motion, formularios.
- Correcciones sobre hallazgos de auditoría. (completado: contraste crítico + labels icon-only + axe Home/Contact + shell técnica Blog en verde)

### Sprint 7 - Contenido premium + SEO (1 semana)

- Sustitución total de placeholder legacy.
- Ajuste de narrativa por mercado objetivo.
- Validación final de metadatos/structured data.

## Backlog detallado (acciones)

### Seguridad / Infra

- [x] BL-SEC-001: Añadir headers de seguridad en `.htaccess`.
- [x] BL-SEC-002: Honeypot anti-bot en formulario contacto.
- [x] BL-SEC-003: Rate-limit suave por IP/sesión en `ajax.php`.
- [x] BL-SEC-004: CSP report-only + recogida de violaciones.

### Rendimiento

- [x] BL-PERF-001: Script de conversión AVIF y mapeo de fallbacks en HTML (`<picture>`).
- [x] BL-PERF-002: Implementar budget de bytes en CI.
- [x] BL-PERF-003: Auditoría de dependencias JS legacy (retirar no usadas).
- [x] BL-PERF-004: Inline crítico mínimo + defer/lazy por prioridad.
- [x] BL-PERF-005: Inicialización diferida del mapa para mejorar coste inicial.
- [x] BL-PERF-006: Añadir soporte WebP al pipeline de medios (requiere tooling de conversión en entorno).
- [x] BL-PERF-007: Carga diferida de `jquery-jvectormap*` para reducir JS inicial.
- [x] BL-PERF-008: Carga diferida de plugins no críticos (`isotope`, `magnific`, `swiper`, `circle-progress`, `zoom`, `scrollbar`).
- [x] BL-PERF-009: Eliminar `banner-bg.gif` legacy y bloquear su reintroducción en quality gates.

### Arquitectura

- [x] BL-ARCH-001: ADR de stack de componentización.
- [x] BL-ARCH-002: Design tokens centralizados.
- [x] BL-ARCH-003: Componente `ProjectCard` data-driven.
- [x] BL-ARCH-004: Componente `TestimonialCard` data-driven.
- [x] BL-ARCH-005: Separar data a `content/*.json`.
- [x] BL-ARCH-006: Workflow de templates y parciales con build/check (`src/pages`, `src/components`, `scripts/build-pages.mjs`).
- [x] BL-ARCH-007: Soporte de directivas `@render` + validación de required fields en `scripts/build-pages.mjs`.
- [x] BL-ARCH-008: Componentización de CTAs (hero/about/training) vía `content/ctas.json` + componentes reutilizables.
- [x] BL-ARCH-009: Extracción de secciones monolíticas `Experience` y `Services` a componentes dedicados para facilitar mantenimiento y futuros datos dinámicos.
- [x] BL-ARCH-010: Migración data-driven de `Services` (`content/services.json` + `@render services-grid`) para editar categorías/cards sin tocar markup estructural.
- [x] BL-ARCH-011: Migración data-driven de la composición de `Experience` (`content/experience.json` + `@render experience-rows`) preservando markup 1:1 en cards independientes.

### Testing / CI

- [x] BL-QA-001: Green Playwright baseline en entorno real.
- [x] BL-QA-002: E2E formulario + rutas externas + idioma.
- [x] BL-QA-003: Regresión visual de home en breakpoints clave.
- [x] BL-QA-004: Test automático de enlaces rotos (internal/external).
- [x] BL-QA-005: Cobertura E2E de navegación por teclado en journeys críticos (tab order + activación sidebar + botón de idioma).
- [x] BL-QA-006: Cobertura E2E adicional de teclado (tab order de formulario de contacto + reachability de redes sociales con labels accesibles).
- [x] BL-QA-007: Cobertura E2E de blog shell (render crítico, links sociales accesibles/hardened, no overflow horizontal en móvil).
- [x] BL-QA-009: Protocolo robusto de operabilidad Playwright (diagnóstico/cleanup de procesos huérfanos + wrapper `test:e2e:clean`).
- [x] BL-QA-010: Expandir regresión visual de Home con snapshots dedicados para `Experience`, `Projects` y `logos`, incluyendo estabilización del carrusel Swiper.
- [ ] BL-QA-008: Re-activar `color-contrast` como regla bloqueante en `tests/e2e/a11y.spec.js` tras cerrar deuda visual de contraste.

### A11y / UX

- [x] BL-UX-001: Auditoría de focus states y orden de tab. (cobertura automatizada en index+blog para navegación crítica, formulario y redes)
- [x] BL-UX-002: Etiquetas ARIA en icon buttons.
- [x] BL-UX-003: Modo `prefers-reduced-motion`.
- [x] BL-UX-004: Estados de error/success de formulario más claros.
- [x] BL-UX-005: Navegación sidebar con anchors semánticos y scroll estable por secciones.
- [x] BL-UX-006: `skip-link` visible en foco para navegación por teclado.
- [x] BL-UX-007: Corregir contrastes `serious/critical` detectados por axe en Home/Contact (CTA amarillos, filtros activos, footer y enlaces de contacto).
- [x] BL-UX-008: Extender `tests/e2e/a11y.spec.js` para cubrir secciones primarias de Home además de Contact.
- [ ] BL-UX-009: Ronda final de contraste WCAG AA en Home (timeline, services cards y tipografías secundarias) para eliminar violaciones `color-contrast`.

### Contenido / Marca

- [ ] BL-CNT-001: Reescritura hero y propuesta de valor.
- [ ] BL-CNT-002: Curar proyectos por impacto (problema -> solución -> resultado).
- [ ] BL-CNT-003: Sustituir textos placeholder legacy.
- [ ] BL-CNT-004: **Resolver bloque Blog Lorem Ipsum (pendiente, no tocar ahora).**
- [x] BL-CNT-005: Retirar experiencia legada del timeline `Experience` y reequilibrar layout (de 2+4+1 a 2+2+2 cards) sin regresiones.
- [x] BL-CNT-006: Retirar la misma marca legada del grid de proyectos y del carrusel de logos para eliminación total en portfolio público.

## Definición de Done por ítem

Un ítem del backlog se considera terminado solo si:

- Código implementado + quality guards verdes.
- Prueba automatizada creada/actualizada donde aplique.
- Métrica afectada medida antes/después (si aplica).
- Documentación mínima actualizada (`README`/`docs`).
- Cambio reversible (rollback claro).

## Notas operativas

- El backlog es vivo; se puede repriorizar semanalmente.
- Cambios de deploy productivo se postergan hasta cerrar baseline local + CI estable.
- El bloque de Blog Lorem Ipsum queda explícitamente pendiente y no se modifica en esta fase.
