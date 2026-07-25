# Requirements - Auditor de Entidad Digital (Entiscore)

## Visión del producto

Entiscore es un agente que recibe la URL de un portfolio personal, perfil profesional o sitio web y genera un reporte claro sobre qué tan reconocible es esa persona o proyecto como entidad legítima para buscadores y sistemas de inteligencia artificial. El reporte incluye un plan de acción priorizado, no solo un diagnóstico técnico.

## Usuario objetivo

Desarrolladores, freelancers y profesionales con presencia online (portfolio, LinkedIn, GitHub) que no saben si esa presencia está optimizada para ser entendida correctamente por motores de búsqueda y por sistemas de IA que generan respuestas sobre personas y proyectos.

---

## Historias de usuario

### HU-01: Solicitar auditoría ingresando una URL - `P0`

**Como** profesional con presencia online,
**quiero** ingresar la URL de mi sitio o portfolio en una interfaz simple,
**para** iniciar un análisis automático de mi entidad digital sin necesidad de configuración previa.

**Criterios de aceptación:**

1. El sistema acepta una URL válida (HTTP o HTTPS) como único input obligatorio.
2. Si la URL no es válida o no es accesible públicamente, el sistema muestra un mensaje de error claro indicando el problema específico (formato inválido, sitio no accesible, timeout).
3. Una vez enviada la URL, el usuario ve un indicador de progreso que confirma que el análisis está en curso.
4. El tiempo máximo de espera para generar el reporte no excede 60 segundos en condiciones normales.
5. No se requiere autenticación ni registro para usar el servicio.

---

### HU-02: Evaluación de datos estructurados (Schema Markup) - `P0`

**Como** profesional que quiere ser encontrado correctamente,
**quiero** saber si mi sitio tiene datos estructurados que describan quién soy o qué hace mi proyecto,
**para** entender si los buscadores y sistemas de IA pueden interpretar mi identidad de forma precisa.

**Criterios de aceptación:**

1. El agente detecta la presencia o ausencia de schema markup en el sitio analizado (JSON-LD, Microdata o RDFa).
2. Si existe schema markup, el agente identifica los tipos utilizados (Person, Organization, WebSite, ProfilePage, u otros relevantes).
3. El agente evalúa la completitud de los campos obligatorios y recomendados del schema detectado según las especificaciones de schema.org.
4. El reporte lista los campos presentes, los faltantes y los que tienen valores incompletos o inconsistentes.
5. Si no existe schema markup, el reporte indica explícitamente su ausencia y recomienda qué tipo de schema sería adecuado según el contenido detectado.

---

### HU-03: Evaluación de consistencia de identidad - `P1`

**Como** profesional con múltiples perfiles online,
**quiero** saber si la información sobre mí es consistente entre las fuentes que enlaza mi sitio,
**para** asegurar que buscadores e IA me reconozcan como una sola entidad coherente.

**Criterios de aceptación:**

1. El agente extrae el nombre, rol/título profesional y enlaces a otras plataformas presentes en el sitio analizado.
2. El agente verifica si los enlaces a perfiles externos (GitHub, LinkedIn, Twitter/X, etc.) son accesibles y apuntan a perfiles reales.
3. El agente compara el nombre y la descripción profesional visible en el sitio con los metadatos disponibles (og:title, meta description, schema name).
4. El reporte señala inconsistencias específicas encontradas (por ejemplo: el nombre en schema dice "Carlos" pero el og:title dice "Charlie Dev").
5. Si no se detectan enlaces a otras plataformas, el reporte lo indica como un área de mejora para fortalecer la identidad cruzada.

**Versión simplificada (si el tiempo no alcanza):** Comparar únicamente el nombre entre el schema markup y el og:title, sin verificar accesibilidad de cada enlace externo uno por uno. Se detectan los enlaces salientes pero no se valida que respondan ni se inspecciona su contenido.

---

### HU-04: Evaluación de señales de autoridad - `P1`

**Como** profesional que quiere posicionarse como referente,
**quiero** conocer qué señales de autoridad son visibles públicamente sobre mi presencia digital,
**para** entender qué percepción tienen los sistemas automatizados sobre mi relevancia.

**Criterios de aceptación:**

1. El agente identifica la presencia de enlaces salientes hacia plataformas de autoridad reconocidas (GitHub, LinkedIn, publicaciones, conferencias, etc.).
2. El agente evalúa si el sitio tiene metadata coherente que refuerce la autoridad (autor definido, fechas de publicación, enlaces canónicos).
3. El agente detecta menciones de logros, certificaciones, proyectos o contribuciones visibles en el contenido del sitio.
4. El reporte indica qué señales de autoridad fueron encontradas y cuáles son oportunidades de mejora.
5. El análisis se limita exclusivamente a información públicamente accesible; no se consultan APIs privadas ni servicios de pago.

**Versión simplificada (si el tiempo no alcanza):** Limitarse a detectar la presencia de enlaces salientes hacia plataformas de autoridad reconocidas (GitHub, LinkedIn, Medium, Dev.to, Speaker Deck, etc.), sin evaluar metadata adicional de autoría ni fechas de publicación.

---

### HU-05: Evaluación de accesibilidad técnica para crawlers - `P0`

**Como** profesional que quiere ser indexado correctamente,
**quiero** saber si mi sitio es técnicamente accesible para los robots de búsqueda e IA,
**para** asegurar que no hay barreras técnicas que impidan que mi contenido sea descubierto.

**Criterios de aceptación:**

1. El agente verifica la presencia y contenido del archivo robots.txt (si existe) y evalúa si bloquea acceso a contenido relevante.
2. El agente verifica la existencia de metadatos esenciales: title, meta description, og:title, og:description, og:image.
3. El agente evalúa si la página responde con un código HTTP exitoso (2xx) y si el tiempo de respuesta es razonable (< 5 segundos).
4. El agente detecta si el contenido principal depende exclusivamente de JavaScript del lado del cliente (SPA sin SSR), lo cual dificulta el crawling.
5. El reporte lista cada problema técnico detectado con una explicación breve de por qué afecta la visibilidad para crawlers.

---

### HU-06: Generación de reporte con puntaje y plan de acción - `P0`

**Como** profesional sin conocimientos técnicos de SEO,
**quiero** recibir un reporte claro con un puntaje general y un plan de acción ordenado por prioridad,
**para** saber exactamente qué mejorar primero sin necesidad de investigar por mi cuenta.

**Criterios de aceptación:**

1. El reporte incluye un puntaje general de madurez de entidad digital en una escala definida (por ejemplo, 0-100 o niveles como Bajo/Medio/Alto/Excelente).
2. El reporte presenta hallazgos específicos agrupados por cada uno de los cuatro ejes evaluados (datos estructurados, consistencia de identidad, señales de autoridad, accesibilidad técnica).
3. El reporte incluye un plan de acción priorizado con al menos 3 recomendaciones concretas, ordenadas de mayor a menor impacto esperado.
4. Cada recomendación del plan de acción indica: qué hacer, por qué importa y el nivel de esfuerzo estimado (bajo/medio/alto).
5. El lenguaje del reporte es claro y libre de jerga técnica innecesaria; un profesional no experto en SEO puede entenderlo sin ayuda externa.
6. El reporte se presenta de forma estructurada y legible tanto en la interfaz web como en formato JSON exportable. Este JSON es exactamente el mismo schema de respuesta que devuelve el endpoint `/api/audit`; no existen dos formatos distintos del mismo reporte.

---

### HU-07: Visualización del reporte en la interfaz - `P0`

**Como** usuario que acaba de solicitar una auditoría,
**quiero** ver el reporte presentado de forma visual y organizada en la interfaz web,
**para** poder leerlo y entenderlo sin necesidad de interpretar datos crudos.

**Criterios de aceptación:**

1. El reporte se muestra en la misma página donde se ingresó la URL, sin navegación adicional requerida.
2. El puntaje general se presenta de forma prominente y visualmente distinguible (color, tamaño, icono según nivel).
3. Los hallazgos por eje son colapsables o están en secciones navegables para no abrumar al usuario con toda la información de golpe.
4. El plan de acción se muestra como una lista ordenada con indicadores visuales de prioridad.
5. La interfaz es responsive y funciona correctamente en desktop y dispositivos móviles.
6. El usuario puede compartir o copiar el reporte fácilmente (copiar texto o link al resultado).

---

## Requisitos funcionales transversales

### RF-01: Acceso a sitios y fuentes externas exclusivamente vía MCP

Todo acceso al sitio analizado y a cualquier fuente externa (fetch de HTML, lectura de robots.txt, verificación de enlaces) se realiza mediante un servidor MCP (Model Context Protocol), no mediante llamadas HTTP directas desde la lógica del agente. Esta es una decisión de arquitectura: el agente orquesta el análisis invocando herramientas expuestas por el servidor MCP, y el servidor MCP es quien ejecuta las operaciones de red. Esto garantiza una separación clara entre la lógica de decisión del agente y la ejecución de operaciones de I/O externas, facilita el testing y permite sustituir o extender las fuentes de datos sin modificar el agente.

---

## Requisitos no funcionales

### RNF-01: Calidad de código

- Sin comentarios dentro del código en ningún archivo.
- Nombres de variables, funciones y componentes autodescriptivos que reemplacen la necesidad de comentarios.
- Tipado estricto de punta a punta (TypeScript strict mode).
- Funciones con una sola responsabilidad; ninguna función excede 30 líneas de lógica.
- Arquitectura limpia con separación entre: lógica del agente, integración con servicios externos, capa de datos y presentación.

### RNF-02: Manejo de errores

- Manejo explícito de errores en cada punto de integración externa (fetch a URLs, parsing de HTML, consultas a APIs).
- Sin fallos silenciosos: cada error se captura, se registra y se comunica al usuario de forma comprensible.
- Timeouts configurados en todas las llamadas de red.
- Degradación graceful: si un eje de análisis falla, los otros tres se evalúan igualmente y el reporte indica qué no pudo evaluarse.

### RNF-03: Rendimiento

- El análisis completo no excede 60 segundos en el caso promedio.
- Las llamadas a servicios externos se paralelizan donde sea posible para reducir latencia total.
- El frontend muestra feedback inmediato al usuario (no hay pantallas en blanco durante la espera).

### RNF-04: Desplegabilidad

- Despliegue en Vercel (frontend + API routes).
- Supabase solo si se necesita persistencia (no es requisito para MVP).
- El proyecto debe poder desplegarse con un solo comando (`vercel deploy` o equivalente).
- Variables de entorno documentadas en `.env.example`.

---

## Fuera de alcance (v1)

- Autenticación de usuarios.
- Historial persistente de auditorías por usuario.
- Soporte multiidioma.
- Análisis de sitios que requieran autenticación para ser accedidos.
- Integración con servicios de pago o APIs con costo.
- Análisis de backlinks reales (requiere herramientas de pago tipo Ahrefs/Moz).
- Uso de infraestructura AWS.

---

## Dependencias entre equipos

| Componente | Responsable | Entregable |
|---|---|---|
| Lógica del agente, MCP, API routes | Yo (backend) | Endpoint `/api/audit` que recibe URL y devuelve reporte en JSON |
| Frontend, UX del reporte | Compañero (frontend) | Interfaz para ingresar URL y visualizar reporte |

**Contrato de interfaz:** El endpoint `/api/audit` recibe `{ "url": string }` y devuelve el reporte completo en formato JSON estructurado. Este JSON de respuesta es el único formato del reporte: es el mismo que el frontend renderiza y el mismo que el usuario puede exportar (HU-06, criterio 6). El schema completo de respuesta se define en el documento de diseño técnico.
