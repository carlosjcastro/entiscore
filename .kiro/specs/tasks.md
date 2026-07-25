# Tareas - Auditor de Entidad Digital (Entiscore)

Referencia: #[[file:.kiro/specs/requirements.md]] · #[[file:.kiro/specs/design.md]]

---

## Bloque P0 - Flujo completo de punta a punta (innegociable para la demo)

Las tareas de este bloque se completan en orden. Al terminar, el producto es demostrable con un flujo funcional: URL de entrada → análisis → reporte visual.

---

### T-01: Inicialización del proyecto Next.js con TypeScript strict

**Responsable:** Backend
**HU relacionada:** Todas
**Entregable:** Proyecto Next.js funcional con configuración base

**Pasos:**

1. Crear proyecto Next.js con App Router y TypeScript
2. Configurar `tsconfig.json` con strict mode habilitado
3. Instalar dependencias: `zod`, `cheerio`
4. Instalar devDependency: `@modelcontextprotocol/sdk` (para servidor MCP de referencia)
5. Configurar Tailwind CSS
6. Crear estructura de carpetas vacía según design.md (`src/agent/`, `src/mcp-server/`, `src/types/`, `src/agent/analyzers/`)
7. Crear `.env.example` con `NODE_ENV=development`
8. Verificar que `npm run dev` levanta sin errores

**Criterio de completitud:** El proyecto compila, levanta en localhost y muestra la página default de Next.js.

---

### T-02: Definición de tipos compartidos

**Responsable:** Backend
**HU relacionada:** HU-06 (contrato del reporte)
**Entregable:** `src/types/audit.ts`, `src/types/mcp-tools.ts`, `src/types/errors.ts`

**Pasos:**

1. Crear `src/types/audit.ts` con las interfaces: `AuditResponse`, `AxisResult`, `Finding`, `ActionItem`, `MaturityLevel`
2. Crear `src/types/mcp-tools.ts` con los schemas Zod de input/output de cada tool (`FetchPageInput`, `FetchPageOutput`, `FetchRobotsTxtInput`, `FetchRobotsTxtOutput`, `CheckUrlAccessibilityInput`, `CheckUrlAccessibilityOutput`)
3. Crear `src/types/errors.ts` con `AuditErrorResponse`, enum de códigos de error (`INVALID_URL`, `FORBIDDEN_URL`, `SITE_UNREACHABLE`, `TIMEOUT`, `INTERNAL_ERROR`)
4. Exportar todo desde un `src/types/index.ts`

**Criterio de completitud:** El proyecto compila sin errores con los tipos definidos. Todos los tipos son importables desde `@/types`.

---

### T-03: Implementación de MCP Tools (funciones de I/O)

**Responsable:** Backend
**HU relacionada:** RF-01 (acceso vía MCP)
**Entregable:** `src/mcp-server/tools/fetch-page.ts`, `fetch-robots-txt.ts`, `check-url-accessibility.ts`

**Pasos:**

1. Implementar `fetchPage`: recibe `{ url }`, hace fetch con timeout de 10s, retorna `{ html, statusCode, responseTimeMs, headers }`
2. Implementar `fetchRobotsTxt`: recibe `{ baseUrl }`, construye URL a `/robots.txt`, fetch con timeout 5s, retorna `{ content, accessible }`
3. Implementar `checkUrlAccessibility`: recibe `{ url }`, hace HEAD request con timeout 5s, retorna `{ accessible, statusCode, responseTimeMs }`
4. Cada función valida su input con el schema Zod correspondiente de `src/types/mcp-tools.ts`
5. Cada función maneja errores de red (timeout, DNS failure, connection refused) y retorna un resultado tipado, nunca lanza excepciones no controladas
6. Exportar las tres funciones desde `src/mcp-server/tools/index.ts`

**Criterio de completitud:** Las tres funciones se pueden invocar con una URL pública real y devuelven datos correctos. Los errores se manejan sin crashear.

---

### T-04: Servidor MCP de referencia

**Responsable:** Backend
**HU relacionada:** RF-01 (demostración MCP)
**Entregable:** `src/mcp-server/index.ts`

**Pasos:**

1. Crear `src/mcp-server/index.ts` usando `@modelcontextprotocol/sdk`
2. Registrar las tres tools (`fetchPage`, `fetchRobotsTxt`, `checkUrlAccessibility`) con sus schemas como server MCP
3. Configurar stdio transport para que pueda levantarse como proceso independiente
4. Crear `.kiro/settings/mcp.json` apuntando a este servidor
5. Verificar que Kiro puede conectarse al servidor y listar las tools

**Criterio de completitud:** El servidor MCP se levanta con `npx tsx src/mcp-server/index.ts` y responde a tool calls. Kiro lo muestra como conectado en el panel MCP.

---

### T-05: Validación de input y seguridad SSRF

**Responsable:** Backend
**HU relacionada:** HU-01
**Entregable:** `src/app/api/audit/validation.ts`

**Pasos:**

1. Crear schema Zod para el request body (`{ url: z.string().url() }`) con refinamiento para aceptar solo `http://` o `https://`
2. Implementar función `validateUrlSafety(url: string)` que:
   - Parsea el hostname de la URL
   - Resuelve DNS del hostname
   - Rechaza si la IP resuelta está en rangos privados: `127.0.0.0/8`, `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`, `169.254.0.0/16`, `::1`
   - Rechaza hostnames literales como `localhost`
3. La función retorna `{ valid: true }` o `{ valid: false, code: "FORBIDDEN_URL", details: string }`
4. Exportar ambas validaciones para uso en el route handler

**Criterio de completitud:** URLs públicas pasan; URLs a localhost, IPs privadas y protocolos no-HTTP son rechazadas con el código de error correcto.

---

### T-06: Analizador de datos estructurados (Schema Markup)

**Responsable:** Backend
**HU relacionada:** HU-02
**Entregable:** `src/agent/analyzers/structured-data.ts`

**Pasos:**

1. Implementar extracción de JSON-LD: buscar tags `<script type="application/ld+json">` y parsear el JSON
2. Implementar detección de Microdata: buscar elementos con atributo `itemscope`/`itemtype`
3. Implementar detección de RDFa: buscar atributos `typeof`/`property` en elementos HTML
4. Si se encuentra schema, identificar los tipos (`Person`, `Organization`, `WebSite`, `ProfilePage`, etc.)
5. Evaluar completitud de campos: comparar los campos presentes contra los campos recomendados para el tipo detectado (definir un mapa de campos esperados por tipo)
6. Generar findings: positivos por cada campo bien implementado, warnings por campos faltantes, critical si no hay schema en absoluto
7. Calcular score del eje (0-100): 0 si no hay schema, puntos por tipo correcto, puntos por completitud de campos
8. Retornar `AxisResult` con findings y score

**Criterio de completitud:** Dado un HTML con JSON-LD de tipo Person con 5 campos, el analizador lo detecta, lista los campos presentes y faltantes, y genera un score coherente.

---

### T-07: Analizador de accesibilidad técnica para crawlers

**Responsable:** Backend
**HU relacionada:** HU-05
**Entregable:** `src/agent/analyzers/technical-accessibility.ts`

**Pasos:**

1. Evaluar respuesta HTTP: verificar statusCode 2xx y responseTimeMs < 5000
2. Extraer metadatos esenciales del HTML: `<title>`, `<meta name="description">`, `<meta property="og:title">`, `<meta property="og:description">`, `<meta property="og:image">`
3. Evaluar robots.txt: si existe, parsear directivas y detectar si bloquea user-agents genéricos o rutas importantes
4. Detectar SPA sin SSR: verificar si el `<body>` tiene contenido textual mínimo (< 100 caracteres de texto visible sugiere SPA client-only)
5. Generar findings por cada problema detectado con explicación de impacto
6. Calcular score del eje (0-100): penalizar por cada metadato faltante, por tiempo de respuesta alto, por bloqueos en robots.txt, por SPA sin contenido
7. Retornar `AxisResult`

**Criterio de completitud:** Dado un HTML con title pero sin og:tags y un robots.txt que bloquea todo, el analizador genera findings correctos y un score bajo.

---

### T-08: Orquestador del agente + scoring + plan de acción

**Responsable:** Backend
**HU relacionada:** HU-06
**Entregable:** `src/agent/orchestrator.ts`, `src/agent/scoring.ts`, `src/agent/action-plan.ts`

**Pasos:**

1. Implementar `orchestrator.ts`:
   - Recibe URL validada
   - Invoca `fetchPage` y `fetchRobotsTxt` en paralelo
   - Construye `AnalysisContext` con los resultados
   - Ejecuta analizadores P0 en paralelo (structured-data, technical-accessibility)
   - Para analizadores P1 no implementados, retorna `status: "partial"` con finding informativo
   - Try/catch individual por analizador: si uno falla, marca `status: "failed"` y sigue
   - Invoca scoring y action-plan con los resultados
   - Retorna `AuditResponse` completo
2. Implementar `scoring.ts`:
   - Calcula `overallScore` como promedio ponderado (pesos definidos en design.md)
   - Excluye ejes con `status: "failed"` y redistribuye pesos
   - Mapea score a `maturityLevel` según rangos definidos
3. Implementar `action-plan.ts`:
   - Recibe los `AxisResult` de todos los ejes
   - Genera `ActionItem[]` a partir de los findings de tipo `warning` y `critical`
   - Ordena por impacto (critical > warning, eje de mayor peso primero)
   - Asigna nivel de esfuerzo estimado según el tipo de recomendación
   - Garantiza al menos 3 recomendaciones (si hay menos findings, agrega recomendaciones genéricas de mejora)

**Criterio de completitud:** Dado un HTML real, el orquestador produce un `AuditResponse` completo con scores, findings y plan de acción coherentes.

---

### T-09: API Route completa (POST /api/audit)

**Responsable:** Backend
**HU relacionada:** HU-01
**Entregable:** `src/app/api/audit/route.ts`

**Pasos:**

1. Implementar POST handler en `route.ts`
2. Parsear body JSON y validar con schema Zod
3. Si validación falla: retornar 400 con `AuditErrorResponse` código `INVALID_URL`
4. Ejecutar `validateUrlSafety`; si falla: retornar 403 con código `FORBIDDEN_URL`
5. Invocar `orchestrator.runAudit(url)`
6. Si timeout global (55s): retornar 504 con código `TIMEOUT`
7. Si error inesperado: retornar 500 con código `INTERNAL_ERROR` (sin exponer stack trace)
8. Si éxito: retornar 200 con `AuditResponse`
9. Agregar headers CORS permisivos para desarrollo

**Criterio de completitud:** El endpoint responde correctamente a URLs válidas (200), URLs malformadas (400), URLs privadas (403) y maneja timeouts sin crashear.

---

### T-10: Frontend - Formulario de input y visualización del reporte

**Responsable:** Frontend (compañero)
**HU relacionada:** HU-01, HU-07
**Entregable:** `src/app/page.tsx`, `src/app/components/`

**Pasos:**

1. Implementar `AuditForm.tsx`: input de URL + botón de envío + estado loading + manejo de errores
2. Implementar `ScoreDisplay.tsx`: puntaje prominente con color según maturityLevel + etiqueta del nivel
3. Implementar `AxisSection.tsx`: sección colapsable por eje con lista de findings (icono + color según tipo)
4. Implementar `ActionPlan.tsx`: lista ordenada de recomendaciones con badge de esfuerzo y prioridad
5. Implementar `FindingCard.tsx`: tarjeta individual con tipo, título, descripción y detalle expandible
6. Integrar todo en `page.tsx`: estado idle → loading → resultado (o error)
7. Agregar botón de copiar reporte (copia JSON al clipboard)
8. Verificar responsive en mobile y desktop

**Criterio de completitud:** El usuario ingresa una URL, ve loading, y al completarse ve el reporte completo organizado por secciones. Funciona en mobile.

---

### T-11: Steering file y hook de Kiro

**Responsable:** Backend
**HU relacionada:** Requisito de uso de Kiro
**Entregable:** `.kiro/steering/coding-standards.md`, hook de validación

**Pasos:**

1. Crear `.kiro/steering/coding-standards.md` con los estándares definidos en RNF-01: sin comentarios, nombres explícitos, tipado estricto, una responsabilidad por función, máximo 30 líneas por función
2. Crear un hook PostFileSave que ejecute `npx tsc --noEmit` para validar que el código compila sin errores de tipos después de cada guardado
3. Verificar que el steering se aplica en las sesiones de Kiro
4. Verificar que el hook se ejecuta al guardar archivos `.ts` o `.tsx`

**Criterio de completitud:** Kiro aplica los estándares al generar código. El hook reporta errores de TypeScript al guardar.

---

### T-12: Deploy en Vercel y verificación end-to-end

**Responsable:** Backend + Frontend
**HU relacionada:** RNF-04
**Entregable:** URL pública funcionando

**Pasos:**

1. Crear repositorio en GitHub y hacer push del código
2. Conectar repositorio a Vercel
3. Verificar que el build pasa sin errores
4. Verificar el flujo completo en la URL de producción: ingresar URL → recibir reporte
5. Verificar manejo de errores en producción (URL inválida, sitio inaccesible)
6. Documentar URL de la demo en README.md

**Criterio de completitud:** La URL de Vercel funciona de punta a punta con una URL real y muestra un reporte correcto.

---

## Bloque P1 - Opcional según tiempo disponible

Estas tareas agregan los ejes de análisis P1. Se implementan solo si el bloque P0 está completo y funcional. Se pueden implementar en versión simplificada si el tiempo aprieta.

---

### T-13: Analizador de consistencia de identidad (HU-03)

**Responsable:** Backend
**HU relacionada:** HU-03
**Entregable:** `src/agent/analyzers/identity-consistency.ts`

**Versión completa:**

1. Extraer nombre del schema markup (campo `name` del JSON-LD)
2. Extraer nombre del `og:title` y del `<title>`
3. Comparar los tres valores; generar warning si difieren significativamente
4. Extraer enlaces a perfiles externos (GitHub, LinkedIn, Twitter, etc.) del HTML
5. Para cada enlace externo, invocar `checkUrlAccessibility` para verificar que responde
6. Generar findings por cada inconsistencia o enlace muerto
7. Calcular score y retornar `AxisResult`

**Versión simplificada (si el tiempo aprieta):**

1. Extraer nombre del schema markup y del `og:title`
2. Comparar ambos valores; generar warning si difieren
3. Extraer enlaces a perfiles externos del HTML (solo listarlos, no verificar accesibilidad)
4. Generar finding informativo si no hay enlaces externos
5. Calcular score y retornar `AxisResult`

**Criterio de completitud:** El analizador detecta inconsistencias de nombre entre schema y og:title y lista los perfiles externos encontrados.

---

### T-14: Analizador de señales de autoridad (HU-04)

**Responsable:** Backend
**HU relacionada:** HU-04
**Entregable:** `src/agent/analyzers/authority-signals.ts`

**Versión completa:**

1. Detectar enlaces salientes hacia plataformas de autoridad reconocidas (GitHub, LinkedIn, Medium, Dev.to, Speaker Deck, YouTube, publicaciones académicas)
2. Evaluar metadata de autoría: buscar `<meta name="author">`, `<link rel="author">`, schema `author` field
3. Detectar fechas de publicación en metadata o content
4. Buscar en el contenido textual menciones de logros, certificaciones, conferencias, contribuciones open source
5. Generar findings y calcular score

**Versión simplificada (si el tiempo aprieta):**

1. Definir lista de dominios de autoridad reconocidos (github.com, linkedin.com, medium.com, dev.to, speakerdeck.com, youtube.com, scholar.google.com)
2. Extraer todos los enlaces salientes del HTML
3. Clasificar cuántos apuntan a plataformas de autoridad vs. otros destinos
4. Generar finding positivo por cada plataforma de autoridad enlazada, warning si no hay ninguna
5. Calcular score basado en cantidad y diversidad de plataformas enlazadas

**Criterio de completitud:** El analizador identifica correctamente enlaces a plataformas de autoridad y genera un score proporcional a la cantidad encontrada.

---

### T-15: Integrar analizadores P1 al orquestador

**Responsable:** Backend
**HU relacionada:** HU-03, HU-04
**Entregable:** Actualización de `src/agent/orchestrator.ts`

**Pasos:**

1. Importar los nuevos analizadores en el orquestador
2. Agregarlos al array de analizadores que se ejecutan en paralelo
3. Remover los stubs que retornaban `status: "partial"` para estos ejes
4. Verificar que el scoring recalcula correctamente con los 4 ejes activos
5. Verificar que el plan de acción incluye recomendaciones de los nuevos ejes
6. Test end-to-end con una URL real para validar coherencia del reporte completo

**Criterio de completitud:** El reporte incluye los 4 ejes evaluados con scores y findings reales. El overallScore refleja los 4 ejes ponderados.

---

## Resumen de dependencias entre tareas

```
T-01 (proyecto base)
 ├── T-02 (tipos)
 │    ├── T-03 (MCP tools)
 │    │    ├── T-04 (servidor MCP referencia)
 │    │    ├── T-05 (validación SSRF)
 │    │    ├── T-06 (analizador structured data)
 │    │    ├── T-07 (analizador technical accessibility)
 │    │    └── T-08 (orquestador) ← depende de T-06, T-07
 │    │         └── T-09 (API route) ← depende de T-05, T-08
 │    │              └── T-10 (frontend) ← depende de T-09
 │    │                   └── T-12 (deploy) ← depende de T-10
 │    └── T-11 (steering + hooks) ← independiente, hacer temprano
 │
 └── [Bloque P1]
      ├── T-13 (analizador identity) ← depende de T-03
      ├── T-14 (analizador authority) ← depende de T-03
      └── T-15 (integrar P1) ← depende de T-13, T-14, T-08
```

---

## Estimación de tiempo

| Tarea | Estimación | Acumulado |
|---|---|---|
| T-01 | 30 min | 0:30 |
| T-02 | 30 min | 1:00 |
| T-03 | 1 hora | 2:00 |
| T-04 | 45 min | 2:45 |
| T-05 | 45 min | 3:30 |
| T-06 | 1.5 horas | 5:00 |
| T-07 | 1.5 horas | 6:30 |
| T-08 | 2 horas | 8:30 |
| T-09 | 1 hora | 9:30 |
| T-10 | 3 horas (frontend) | 12:30 |
| T-11 | 30 min | 13:00 |
| T-12 | 1 hora | 14:00 |
| **Total P0** | **~14 horas** | |
| T-13 | 1.5 horas | 15:30 |
| T-14 | 1 hora | 16:30 |
| T-15 | 30 min | 17:00 |
| **Total P0+P1** | **~17 horas** | |
