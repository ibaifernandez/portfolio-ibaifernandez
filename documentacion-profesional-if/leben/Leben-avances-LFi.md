# Leben — avances y mejoras en formato dossier LFi

Documento de trabajo reconstruido a partir de `leben.pdf` y `LFI-DOSSIER-INPUT-TEMPLATE.md`.

**Alcance:** solo avances asociados a **Inmobiliaria Leben**.

**Criterio:**
- `[confirmado]` dato sólido y publicable según el material disponible.
- `[aprox]` formulación razonable inferida del material.
- `[duda]` punto que conviene contrastar antes de convertirlo en claim personal o corporativo.
- `[confidencial]` no publicable tal cual; útil para orientar narrativa.

---

## 6. Leben — reconstruido

### 6.1 Qué sabemos de momento

- [extraído] Existe una presentación PDF (`leben.pdf`) preparada por **Mónica Montúfar** para uso personal.
- [extraído] Tú ya eras **coordinador de marketing** cuando se realizó ese trabajo.
- [extraído] Consideras que, por ser su superior directo y estar dentro de tu scope de coordinación, sí puede entrar en el dossier de LFi.
- [confirmado] La presentación define el caso como una **optimización de entregabilidad y conversión** para Inmobiliaria Leben.
- [confirmado] La portada resume el objetivo así: transformar una base de **69.000 contactos** en una máquina de conversión de alta precisión.

### 6.2 Lo que sí puede completarse ya

- **Tipo de proyecto:**
  - [confirmado] Caso de optimización integral de email marketing para cliente inmobiliario.
  - [confirmado] El trabajo abarcó **entregabilidad**, **reputación de dominio**, **higiene de base de datos**, **migración de ESP**, **optimización UX del email** y **mejora de engagement / CTR**.

- **Objetivo del cliente:**
  - [confirmado] Recuperar la capacidad de entrega y evitar riesgo reputacional del dominio.
  - [confirmado] Convertir una base masiva y ruidosa en una lista más útil para comunicación comercial.
  - [confirmado] Mejorar aperturas, clics e interacción real con la oferta inmobiliaria.

- **Qué problema había:**
  - [confirmado] Base de datos de **69.000 contactos** con falta de segmentación.
  - [confirmado] **Tasa de apertura inicial de 8,68%**.
  - [confirmado] **Reputación de dominio amenazada** por alto volumen de rebotes.
  - [confirmado] Riesgo de entrada en listas negras de proveedores como **Hotmail / Outlook**.
  - [confirmado] Comunicación ineficiente por envíos masivos sin suficiente depuración ni priorización.

- **Qué diseñó / ejecutó el equipo:**
  - [confirmado] Gestión de listas negras mediante solicitud formal a soporte de Microsoft para remoción en Hotmail / Outlook.
  - [confirmado] Auditoría del historial de envío para identificar fuentes de spam.
  - [confirmado] Implementación de **warm-up gradual de IP**.
  - [confirmado] Refuerzo de infraestructura DNS con **SPF, DKIM y DMARC**.
  - [confirmado] Depuración profunda de base mediante lógica de negocio y consultas **SQL**.
  - [confirmado] Eliminación de **rebotes duros**.
  - [confirmado] Filtrado por fecha de última apertura y último clic.
  - [confirmado] Identificación de dominios inválidos o posibles **spam traps**.
  - [confirmado] Migración de **Mailchimp** a **Brevo**.
  - [confirmado] Rediseño de plantillas orientado a conversión y optimizado para móvil.
  - [confirmado] Integración de **WhatsApp** como canal de respuesta directa.
  - [confirmado] Reestructuración del email para navegación clara entre proyectos inmobiliarios.
  - [confirmado] Optimización de ventanas de envío basada en análisis de comportamiento histórico.

- **Qué decidiste tú:**
  - [duda] Datos insuficientes para verificar la separación exacta entre decisiones tuyas, ejecución directa de Mónica y trabajo del resto del equipo.
  - [confirmado] Según la plantilla interna, el caso estaba dentro de tu **scope de coordinación**.
  - [aprox] La forma prudente de presentarlo en el dossier es como **caso coordinado / supervisado dentro del área**, salvo que luego añadas evidencia más específica de autoría decisional.

- **Qué aprobaste / coordinaste / corregiste:**
  - [duda] Datos insuficientes para verificar con precisión qué entregables aprobaste personalmente y cuáles solo acompañaste desde coordinación.
  - [aprox] Sí puede afirmarse que el caso estaba dentro del perímetro operativo del área y que formó parte de una intervención más amplia de mejora técnica y de performance.

- **Qué resultados hubo:**
  - [confirmado] La base pasó de **69.000 contactos** a **20.500 efectivos**.
  - [confirmado] Distribución de la base saneada: **11.000 activos** y **9.500 reactivos**.
  - [confirmado] La tasa de entrega final llegó a **99,66%**.
  - [confirmado] La apertura máxima detectada en ventana óptima llegó a **47%**.
  - [confirmado] La apertura comparativa pasó de **8,68% (mayo)** a **39,63% (diciembre)**.
  - [confirmado] La presentación reporta **+356% de incremento** en apertura.
  - [confirmado] Los rebotes duros pasaron de **4.087** a **5**.
  - [confirmado] La presentación reporta una **reducción del 99,8%** en rebotes duros.
  - [confirmado] El CTR pasó de **0,92%** a **3,70%**.
  - [confirmado] La presentación reporta **+302% de crecimiento** en CTR.

- **Qué assets existen:**
  - [confirmado] Presentación `leben.pdf` con narrativa, métricas y visuales del caso.
  - [confirmado] Gráficas de apertura, rebotes, CTR y depuración de base dentro del PDF.
  - [confirmado] Captura del **email ganador** dentro del PDF.
  - [confirmado] Mensajes / citas internas de framing estratégico incluidos en la presentación.

- **Qué puede afirmarse públicamente sin problema:**
  - [confirmado] Que hubo una intervención combinada de **higiene de datos + reputación técnica + migración + rediseño UX**.
  - [confirmado] Que esa intervención se asocia en la presentación a mejoras fuertes de entregabilidad, aperturas, rebotes y CTR.
  - [aprox] Que el caso demuestra capacidad de transformar una operación de envío masivo en un sistema más sano, segmentado y orientado a conversión.
  - [duda] Conviene evitar afirmar autoría individual detallada sin evidencia adicional.

### 6.3 Reconstrucción del caso en secuencia operativa

#### 1) Diagnóstico inicial

- [confirmado] Leben operaba con una base de **69.000 contactos**.
- [confirmado] El problema no era solo de volumen, sino de **volumen mal gestionado**.
- [confirmado] La combinación de baja segmentación, rebotes altos y mala reputación comprometía la comunicación con leads potenciales.
- [confirmado] La tasa de apertura de referencia era **8,68%**, descrita en la presentación como críticamente baja.

#### 2) Contención del riesgo técnico

- [confirmado] Se activó una fase de recuperación de confianza centrada en listas negras y reputación.
- [confirmado] Se gestionó remoción con soporte de Microsoft para Hotmail / Outlook.
- [confirmado] Se auditó el historial de envíos para detectar focos de spam.
- [confirmado] Se aplicó warm-up de IP para reconstruir reputación.
- [confirmado] Se consolidó la base técnica con **SPF, DKIM y DMARC** para que el correo fuese reconocido como seguro y legítimo.

#### 3) Higiene profunda de base de datos

- [confirmado] Se aplicó depuración con consultas SQL y lógica de negocio.
- [confirmado] Se eliminaron rebotes duros.
- [confirmado] Se filtró la base por actividad reciente: aperturas y clics.
- [confirmado] Se depuraron dominios inválidos y registros problemáticos.
- [confirmado] Resultado operativo: la base útil quedó en **20.500 contactos efectivos**.

#### 4) Replanteamiento de plataforma e infraestructura

- [confirmado] Se ejecutó migración de **Mailchimp** a **Brevo**.
- [confirmado] La migración se presenta como una decisión para estabilizar reputación y mejorar capacidad de entrega técnica.
- [confirmado] El resultado declarado fue una infraestructura más saneada y escalable.

#### 5) Optimización del mensaje y del recorrido de conversión

- [confirmado] Se rediseñaron plantillas con foco en conversión y navegación móvil.
- [confirmado] Se introdujo un canal directo de respuesta vía **WhatsApp** para reducir fricción.
- [confirmado] Se organizó el contenido para mostrar múltiples proyectos y facilitar exploración autónoma.
- [confirmado] El email ganador utilizó un asunto corto de valor: **"BLACK INMOBILIARIO | Desde UF 3.231"**.
- [confirmado] La estructura multi-proyecto incluía al menos **Puerto Montt** y **Valdivia** como opciones visibles.

#### 6) Optimización de envíos basada en comportamiento

- [confirmado] Se analizaron patrones históricos de interacción.
- [confirmado] La presentación identifica **domingo** como día ganador.
- [confirmado] Las ventanas destacadas fueron **08:00 AM** y **10:00 PM**.
- [confirmado] El material enfatiza el valor del envío nocturno del domingo como momento previo a la semana laboral.
- [confirmado] En la ventana óptima, la presentación reporta una apertura máxima de **47%**.

#### 7) Consolidación del resultado

- [confirmado] La correlación mostrada en el dashboard vincula limpieza de base con mejora de rendimiento.
- [confirmado] Entre mayo y diciembre se reporta mejora simultánea de aperturas y reducción drástica de rebotes.
- [confirmado] La entrega final quedó en **99,66%**.
- [confirmado] El CTR final quedó en **3,70%** frente a un **0,92%** anterior.
- [aprox] El caso puede leerse como validación de una tesis operativa: **limpiar, sanear y rediseñar produce mejor interacción que insistir en volumen bruto**.

### 6.4 Resultados cuantitativos listos para el dossier

- [confirmado] Base inicial: **69.000 contactos**.
- [confirmado] Base efectiva tras depuración: **20.500**.
- [confirmado] Activos: **11.000**.
- [confirmado] Reactivos: **9.500**.
- [confirmado] Tasa de apertura inicial: **8,68%**.
- [confirmado] Tasa de apertura final: **39,63%**.
- [confirmado] Mejora reportada en apertura: **+356%**.
- [confirmado] Apertura máxima en ventana óptima: **47%**.
- [confirmado] Rebotes duros iniciales: **4.087**.
- [confirmado] Rebotes duros finales: **5**.
- [confirmado] Reducción reportada en rebotes duros: **99,8%**.
- [confirmado] Tasa de entrega final: **99,66%**.
- [confirmado] CTR inicial: **0,92%**.
- [confirmado] CTR final: **3,70%**.
- [confirmado] Crecimiento reportado de CTR: **+302%**.

### 6.5 Problemas reales resueltos en Leben

- [confirmado] Se detuvo una dinámica de envío masivo con riesgo reputacional alto.
- [confirmado] Se redujo el ruido de base para concentrar el canal en usuarios más aprovechables.
- [confirmado] Se restauró la legitimidad técnica del dominio ante proveedores de correo.
- [confirmado] Se sustituyó una lógica de volumen por una lógica de **calidad de base + timing + UX + canal directo**.
- [confirmado] Se hizo más simple el camino de interacción del usuario interesado.

### 6.6 Qué parte del valor del caso es técnica y qué parte es estratégica

- **Técnica**
  - [confirmado] Recuperación de reputación de dominio.
  - [confirmado] DNS autenticado con SPF / DKIM / DMARC.
  - [confirmado] Warm-up de IP.
  - [confirmado] SQL para depuración de base.
  - [confirmado] Migración de ESP.

- **Estratégica / comercial**
  - [confirmado] Rediseño UX del correo.
  - [confirmado] Inclusión de WhatsApp como vía de fricción baja.
  - [confirmado] Organización multi-proyecto para aumentar clics.
  - [confirmado] Optimización de horarios de envío según comportamiento.
  - [confirmado] Reenfoque desde volumen bruto hacia engagement y conversión.

### 6.7 Claims públicos posibles

- [confirmado] En Leben se transformó una base de **69.000 contactos** en una operación de email más precisa, sana y orientada a conversión.
- [confirmado] La intervención combinó reputación técnica, higiene de base, migración de plataforma y rediseño de experiencia de email.
- [confirmado] El caso reportó una mejora de apertura de **8,68% a 39,63%** y una reducción de rebotes duros de **4.087 a 5**.
- [confirmado] La entregabilidad final reportada fue de **99,66%**.
- [confirmado] El CTR pasó de **0,92% a 3,70%** tras la optimización integral.
- [aprox] Es un buen caso para demostrar capacidad de ordenar operaciones frágiles y convertir problemas técnicos en mejora comercial medible.

### 6.8 Claims que conviene matizar o no afirmar todavía

- [duda] “Yo diseñé personalmente toda la estrategia” → no verificable con el material disponible.
- [duda] “Yo ejecuté personalmente cada mejora técnica y cada activo” → no verificable con el material disponible.
- [duda] “El aumento de ingresos quedó demostrado” → la presentación habla de validación del ROI y de correlación con performance, pero no aporta cifra económica explícita.
- [duda] “El 47% fue el nuevo promedio estructural” → la fuente habla de **apertura máxima** en ventana óptima, no de promedio sostenido.

### 6.9 Pruebas / assets disponibles

#### 15.1 Capturas / dashboards / diagramas

- **Presentación general del caso**
  - Qué muestra: narrativa completa de diagnóstico, intervención y resultados.
  - Dónde está guardada: `leben.pdf`.
  - ¿Es publicable?: [duda] revisar si era de uso personal o interno antes de publicarla íntegra.

- **Dashboard de evolución**
  - Qué muestra: comparación mayo vs. diciembre en aperturas y rebotes duros.
  - Dónde está guardada: página de dashboard dentro de `leben.pdf`.
  - ¿Es publicable?: [aprox] sí, si se presenta como datos internos del caso y no vulnera NDA.

- **Gráfica de CTR**
  - Qué muestra: paso de **0,92%** a **3,70%**.
  - Dónde está guardada: bloque “Resultados Impactantes en Engagement y CTR” dentro de `leben.pdf`.
  - ¿Es publicable?: [aprox] sí, con las mismas cautelas anteriores.

- **Email ganador**
  - Qué muestra: asunto, estructura multi-proyecto, layout y presencia de WhatsApp.
  - Dónde está guardada: bloque “Anatomía del Email Ganador” dentro de `leben.pdf`.
  - ¿Es publicable?: [duda] revisar permisos sobre piezas creativas del cliente.

#### 15.2 SOPs / documentos / presentaciones

- `leben.pdf`
  - [confirmado] principal fuente del caso.
- `LFI-DOSSIER-INPUT-TEMPLATE.md`
  - [confirmado] plantilla base para integrar el caso al dossier LFi.

#### 15.3 Testimonios / personas

- **Mónica Montúfar**
  - Qué puede avalar: ejecución, narrativa del caso, métricas presentadas y relación del trabajo con el área.
  - Dónde está la prueba: autoría / firma al cierre de la presentación.
  - ¿Se puede citar públicamente?: [duda] depende de consentimiento y contexto.

### 6.10 Límites y confidencialidad

#### 16.1 Cosas que NO conviene afirmar tal cual

- [duda] Autoría individual exhaustiva del caso sin desglose adicional.
- [duda] Cifras económicas de ROI no visibles en la fuente.
- [duda] Que todas las mejoras fueron exclusivamente tuyas y no del equipo.

#### 16.2 Cosas que sí pueden insinuarse pero no cuantificarse aún

- [aprox] Que hubo mejora comercial derivada de la mejora técnica.
- [aprox] Que la depuración permitió orientar mejor el esfuerzo comercial.
- [aprox] Que la experiencia del usuario en el email mejoró la interacción.

#### 16.3 Cosas que sí pueden contarse sin miedo

- [confirmado] Problema inicial de base masiva y mala reputación.
- [confirmado] Recuperación técnica con DNS, warm-up y limpieza de base.
- [confirmado] Migración Mailchimp → Brevo.
- [confirmado] Optimización UX y canal WhatsApp.
- [confirmado] Mejoras cuantitativas en apertura, rebotes, entrega y CTR.

---

## 14. Resultados cuantitativos — bloque listo para copiar al dossier

- [confirmado] optimización de una base de **69.000 contactos** hacia una lista efectiva de **20.500**.
- [confirmado] mejora de apertura de **8,68%** a **39,63%**.
- [confirmado] pico de apertura de **47%** en ventana óptima.
- [confirmado] reducción de rebotes duros de **4.087** a **5**.
- [confirmado] entregabilidad final de **99,66%**.
- [confirmado] mejora de CTR de **0,92%** a **3,70%**.

### Claims listos para publicar

- [confirmado] coordiné / participé en un caso de saneamiento técnico y comercial que convirtió una operación de email masiva y frágil en un canal con **99,66% de entregabilidad**.
- [duda] usa “coordiné” solo si quieres asumir esa formulación pública; usa “formó parte de mi scope de coordinación” si prefieres máxima prudencia.
- [confirmado] el caso reportó una mejora de apertura desde **8,68%** hasta **39,63%**, con reducción de rebotes duros del **99,8%**.
- [confirmado] la optimización del email y del canal elevó el CTR de **0,92%** a **3,70%**.

---

## 17. Material listo para convertir en copy del dossier

### 17.1 Titulares posibles

- T1: **De base masiva en riesgo a canal de email saneado y rentable**
- T2: **Cómo se recuperó la entregabilidad de Leben y se multiplicó su engagement**
- T3: **Reputación, limpieza y UX: la triple palanca que reordenó el email de Leben**
- T4: **Menos ruido, más entrega, más clic: reconstrucción operativa del caso Leben**

### 17.2 Subtítulos posibles

- S1: **Intervención integral sobre reputación técnica, base de datos, plataforma y experiencia de usuario.**
- S2: **De 69.000 contactos ruidosos a una lista efectiva con 99,66% de entrega y mejora fuerte de aperturas y CTR.**
- S3: **Un caso donde la higiene de datos dejó de ser mantenimiento y pasó a ser palanca de negocio.**

### 17.3 Frases de cierre

- C1: **El caso Leben demuestra que la entregabilidad no se resuelve solo enviando mejor, sino saneando sistema, base y recorrido.**
- C2: **La mejora no vino del volumen, sino de ordenar infraestructura, depurar audiencia y reducir fricción de respuesta.**
- C3: **Cuando el canal técnico se sanea y el mensaje se vuelve navegable, el performance deja de depender de la suerte.**

---

## Versión breve, lista para integrar en `lfi.html`

**Leben** fue un caso de recuperación integral del canal de email: se partía de una base de **69.000 contactos**, baja apertura (**8,68%**) y una reputación de dominio comprometida por el volumen de rebotes. La intervención combinó limpieza profunda de base con SQL, recuperación de reputación, autenticación DNS (**SPF, DKIM, DMARC**), warm-up de IP, migración de **Mailchimp a Brevo** y rediseño del email con foco en UX móvil, navegación multi-proyecto y contacto directo por **WhatsApp**. Según la presentación del caso, el resultado fue una base efectiva de **20.500 registros**, una entregabilidad final del **99,66%**, mejora de apertura hasta **39,63%**, caída de rebotes duros de **4.087** a **5** y crecimiento del CTR de **0,92%** a **3,70%**.
