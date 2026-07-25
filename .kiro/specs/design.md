# Diseño Técnico - Auditor de Entidad Digital (Entiscore)

Referencia: #[[file:.kiro/specs/requirements.md]]

---

## 1. Arquitectura general

```
┌─────────────────────────────────────────────────────────────┐
│                        Vercel                                │
│                                                             │
│  ┌──────────────┐     ┌──────────────────────────────────┐  │
│  │   Next.js    │     │         API Route                │  │
│  │   Frontend   │────▶│     POST /api/audit              │  │
│  │  (React/TS)  │◀────│                                  │  │
│  └──────────────┘     └──────────────┬───────────────────┘  │
│                                      │                      │
│                        ┌─────────────▼─────────────┐        │
│                        │    Agent Orchestrator     │        │
│                        │  (lógica de decisión)     │        │
│                        └─────────────┬─────────────┘        │
│                                      │ direct function call  │
│                        ┌─────────────▼─────────────┐        │
│                        │      MCP Tools            │        │
│                        │  (funciones de I/O)       │        │
│                        └─────────────┬─────────────┘        │
│                                      │                      │
└──────────────────────────────────────┼──────────────────────┘
                                       │ HTTP/Network
                          ┌────────────▼────────────┐
                          │    Sitio objetivo +     │
                          │    fuentes externas     │
                          └─────────────────────────┘
```

### Capas del sistema

| Capa | Responsabilidad | Ubicación en el repo |
|------|----------------|---------------------|
| **Presentación** | UI para ingresar URL y visualizar reporte | `src/app/` (Next.js App Router) |
| **API** | Endpoint HTTP, validación de input, serialización de respuesta | `src/app/api/audit/` |
| **Orquestador del agente** | Coordina los analizadores, calcula puntaje, genera plan de acción | `src/agent/` |
| **Analizadores** | Lógica específica de cada eje de evaluación | `src/agent/analyzers/` |
| **MCP Tools** | Funciones de acceso a red (fetch HTML, robots.txt, headers) | `src/mcp-server/` |
| **Tipos compartidos** | Interfaces TypeScript del contrato de datos | `src/types/` |

---

## 2. Stack tecnológico

| Componente | Tecnología | Justificación |
|---|---|---|
| Framework | Next.js 14+ (App Router) | Unifica frontend y API en un solo deploy; soporte nativo en Vercel |
| Lenguaje | TypeScript (strict mode) | Tipado de punta a punta, requisito no funcional |
| MCP SDK | `@modelcontextprotocol/sdk` | SDK oficial; usado solo para el servidor MCP de referencia (no en runtime de producción) |
| HTML Parsing | `cheerio` | Parsing ligero de HTML sin browser, ideal para serverless |
| Validación | `zod` | Validación de input/output con inferencia de tipos |
| UI | React + Tailwind CSS | Rápido de implementar, responsive por defecto |
| Deploy | Vercel | Deploy con un comando, ideal para el tiempo disponible |
| Persistencia | Ninguna (v1) | No se persisten reportes; todo es stateless |

---

## 3. Contrato del endpoint `/api/audit`

### Request

```
POST /api/audit
Content-Type: application/json

{
  "url": "https://ejemplo.com"
}
```

### Validación de input (Zod)

```typescript
{
  url: z.string().url().startsWith("http")
}
```

### Validación de seguridad (SSRF)

Antes de que cualquier tool acceda a la URL, se aplica una validación adicional que rechaza:

- URLs que resuelvan a `localhost` o `127.0.0.1`
- URLs que apunten a rangos de IP privados: `10.x.x.x`, `172.16.x.x–172.31.x.x`, `192.168.x.x`
- URLs que apunten a link-local: `169.254.x.x`
- URLs con protocolos distintos de `http` o `https` (por ejemplo `file://`, `ftp://`)
- URLs con hostnames que resuelvan a direcciones IPv6 loopback (`::1`)

Esta validación se implementa como una función dedicada (`validateUrlSafety`) que se invoca después de la validación Zod y antes de pasar la URL al orquestador. Si la URL no pasa esta validación, se devuelve un error con código `FORBIDDEN_URL`.

```typescript
interface AuditErrorResponse {
  error: string
  code: "INVALID_URL" | "FORBIDDEN_URL" | "SITE_UNREACHABLE" | "TIMEOUT" | "INTERNAL_ERROR"
  details?: string
}
```

El código `FORBIDDEN_URL` se usa específicamente cuando la URL tiene formato válido pero apunta a un destino no permitido por razones de seguridad.

### Response - Éxito (200)

```typescript
interface AuditResponse {
  url: string
  timestamp: string
  overallScore: number
  maturityLevel: "bajo" | "medio" | "alto" | "excelente"
  axes: {
    structuredData: AxisResult
    identityConsistency: AxisResult
    authoritySignals: AxisResult
    technicalAccessibility: AxisResult
  }
  actionPlan: ActionItem[]
}

interface AxisResult {
  score: number
  status: "evaluated" | "partial" | "failed"
  findings: Finding[]
}

interface Finding {
  type: "positive" | "warning" | "critical"
  title: string
  description: string
  details?: string
}

interface ActionItem {
  priority: number
  title: string
  reason: string
  effort: "bajo" | "medio" | "alto"
  axis: "structuredData" | "identityConsistency" | "authoritySignals" | "technicalAccessibility"
}
```

### Response - Error (400 | 403 | 422 | 500)

```typescript
interface AuditErrorResponse {
  error: string
  code: "INVALID_URL" | "FORBIDDEN_URL" | "SITE_UNREACHABLE" | "TIMEOUT" | "INTERNAL_ERROR"
  details?: string
}
```

### Cálculo de `overallScore`

Promedio ponderado de los cuatro ejes:

| Eje | Peso |
|---|---|
| Datos estructurados | 30% |
| Consistencia de identidad | 20% |
| Señales de autoridad | 20% |
| Accesibilidad técnica | 30% |

Cada eje se puntúa de 0 a 100. El `overallScore` resultante se mapea a `maturityLevel`:

- 0–39: `"bajo"`
- 40–59: `"medio"`
- 60–79: `"alto"`
- 80–100: `"excelente"`

Si un eje tiene `status: "failed"`, se excluye del promedio y el peso se redistribuye proporcionalmente entre los ejes evaluados.

---

## 4. Integración MCP - Tools como funciones in-process

### Decisión de arquitectura

Las herramientas MCP (tools) se implementan como funciones TypeScript puras que respetan el contrato de input/output definido en esta sección. El orquestador las invoca directamente como funciones normales dentro del mismo proceso, sin transporte real de protocolo (sin stdio, sin HTTP entre procesos).

**Razón:** El transporte stdio está diseñado para comunicación entre dos procesos separados. Implementarlo dentro de una función serverless de Vercel consumiría tiempo de desarrollo sin aportar valor funcional en esta versión. Las funciones ya respetan el contrato MCP (input tipado → output tipado), por lo que la separación arquitectónica se mantiene.

**Preparación para el futuro:** La carpeta `src/mcp-server/` contiene un archivo `index.ts` que expone las mismas tools como servidor MCP real usando `@modelcontextprotocol/sdk`. Este archivo permite levantar las tools como proceso MCP independiente si en el futuro se despliega por separado (por ejemplo, para que un LLM las invoque directamente). En v1, este archivo existe como referencia pero no se usa en producción.

### Tools definidas

| Tool name | Input | Output | Descripción |
|---|---|---|---|
| `fetchPage` | `{ url: string }` | `{ html: string, statusCode: number, responseTimeMs: number, headers: Record<string, string> }` | Obtiene el HTML completo de una URL con headers de respuesta |
| `fetchRobotsTxt` | `{ baseUrl: string }` | `{ content: string \| null, accessible: boolean }` | Obtiene el robots.txt del dominio raíz |
| `checkUrlAccessibility` | `{ url: string }` | `{ accessible: boolean, statusCode: number, responseTimeMs: number }` | Verifica si una URL responde (HEAD request) |

Cada tool es una función async exportada desde su propio archivo, con tipado estricto de input y output via Zod schemas.

### Flujo de ejecución

```
1. API Route recibe POST con { url }
2. Valida input con Zod (incluye validación SSRF)
3. Instancia el Agent Orchestrator
4. El Orchestrator invoca tools en paralelo (llamadas directas a funciones):
   - fetchPage(url) → HTML principal
   - fetchRobotsTxt(baseUrl) → robots.txt
5. Con el HTML obtenido, ejecuta los 4 analizadores en paralelo:
   - StructuredDataAnalyzer
   - IdentityConsistencyAnalyzer
   - AuthoritySignalsAnalyzer
   - TechnicalAccessibilityAnalyzer
6. Cada analizador puede invocar tools adicionales si lo necesita
   (ej: checkUrlAccessibility para verificar enlaces externos)
7. El Orchestrator recolecta resultados, calcula overallScore, genera actionPlan
8. Devuelve AuditResponse al API Route
9. API Route serializa y responde al frontend
```

### Configuración MCP para desarrollo local (uso con Kiro IDE)

Se define en `.kiro/settings/mcp.json` para que Kiro pueda invocar las tools directamente durante el desarrollo:

```json
{
  "mcpServers": {
    "entiscore-tools": {
      "command": "npx",
      "args": ["tsx", "src/mcp-server/index.ts"],
      "disabled": false
    }
  }
}
```

Este servidor MCP es independiente del flujo de producción. En producción, el orquestador llama a las funciones directamente sin pasar por protocolo MCP.

---

## 5. Separación de capas - Detalle

### 5.1 Capa de Presentación (`src/app/`)

Responsabilidad exclusiva: renderizar UI y gestionar estado del cliente.

```
src/app/
├── page.tsx              → Página principal (input + reporte)
├── layout.tsx            → Layout global
└── components/
    ├── AuditForm.tsx     → Formulario de input de URL
    ├── ScoreDisplay.tsx  → Visualización del puntaje general
    ├── AxisSection.tsx   → Sección colapsable por eje
    ├── ActionPlan.tsx    → Lista de recomendaciones priorizadas
    └── FindingCard.tsx   → Tarjeta individual de hallazgo
```

### 5.2 Capa API (`src/app/api/audit/`)

Responsabilidad exclusiva: recibir HTTP request, validar, delegar al orquestador, devolver response.

```
src/app/api/audit/
└── route.ts              → POST handler, validación Zod, invocación del orchestrator
```

### 5.3 Capa del Agente (`src/agent/`)

Responsabilidad: lógica de negocio del análisis. No ejecuta I/O directamente.

```
src/agent/
├── orchestrator.ts       → Coordina analizadores, calcula score, genera action plan
├── scoring.ts            → Lógica de cálculo de puntaje y nivel de madurez
├── action-plan.ts        → Generación del plan de acción priorizado
└── analyzers/
    ├── structured-data.ts
    ├── identity-consistency.ts
    ├── authority-signals.ts
    └── technical-accessibility.ts
```

Cada analizador implementa una interfaz común:

```typescript
interface Analyzer {
  analyze(context: AnalysisContext): Promise<AxisResult>
}

interface AnalysisContext {
  url: string
  html: string
  statusCode: number
  responseTimeMs: number
  headers: Record<string, string>
  robotsTxt: string | null
  tools: McpTools
}

interface McpTools {
  fetchPage: (input: { url: string }) => Promise<FetchPageOutput>
  fetchRobotsTxt: (input: { baseUrl: string }) => Promise<FetchRobotsTxtOutput>
  checkUrlAccessibility: (input: { url: string }) => Promise<CheckUrlAccessibilityOutput>
}
```

Los analizadores reciben las tools como dependencia inyectada, no las importan directamente. Esto mantiene la testabilidad y la separación entre lógica y I/O.

### 5.4 Capa MCP Tools (`src/mcp-server/`)

Responsabilidad exclusiva: encapsular toda operación de I/O de red en funciones tipadas.

```
src/mcp-server/
├── index.ts              → Servidor MCP de referencia (expone tools via SDK para uso con Kiro/LLMs)
└── tools/
    ├── fetch-page.ts           → Función + schema Zod de input/output
    ├── fetch-robots-txt.ts     → Función + schema Zod de input/output
    └── check-url-accessibility.ts → Función + schema Zod de input/output
```

El `index.ts` usa `@modelcontextprotocol/sdk` para exponer las mismas funciones como servidor MCP real. Este archivo se usa durante desarrollo (via `.kiro/settings/mcp.json`) y sirve como demostración de que la arquitectura es MCP-ready. En producción, el orquestador importa las funciones directamente desde `tools/`.

### 5.5 Tipos compartidos (`src/types/`)

```
src/types/
├── audit.ts              → AuditResponse, AxisResult, Finding, ActionItem
├── mcp-tools.ts          → Schemas de input/output de cada tool MCP
└── errors.ts             → AuditErrorResponse, códigos de error
```

---

## 6. Manejo de errores

### Estrategia por capa

| Capa | Estrategia |
|---|---|
| API Route | Captura cualquier excepción, mapea a `AuditErrorResponse`, nunca expone stack traces |
| Orchestrator | Try/catch por analizador; si uno falla, marca `status: "failed"` y continúa con los otros |
| Analizadores | Lanzan excepciones tipadas (`AnalysisError`) con contexto específico |
| MCP Tools | Timeout de 10s por tool call; retorna error estructurado si falla |

### Timeouts

- Fetch de página principal: 10 segundos
- Fetch de robots.txt: 5 segundos
- Check de accesibilidad de enlace: 5 segundos
- Timeout global del análisis completo: 55 segundos (deja 5s de margen para serialización)

---

## 7. Decisiones de diseño y trade-offs

| Decisión | Alternativa descartada | Razón |
|---|---|---|
| MCP tools como funciones directas in-process | MCP via stdio transport real | El transporte stdio es para dos procesos separados; dentro de una serverless no aporta valor y consume tiempo de implementación. La separación arquitectónica se mantiene por contrato de tipos |
| Servidor MCP de referencia incluido | No incluir servidor MCP | Demuestra que la arquitectura está preparada para exponerse como MCP real; útil para el hackathon y para uso futuro |
| Cheerio para parsing | Puppeteer/Playwright | Serverless-friendly, sin necesidad de browser headless; limitación: no ejecuta JS |
| Sin persistencia (v1) | Supabase desde el inicio | Reduce scope; el reporte es stateless, se regenera cada vez |
| Puntaje ponderado fijo | ML/heurísticas adaptativas | Predecible, explicable, implementable en el tiempo disponible |
| Tailwind CSS | Chakra/MUI | Zero config con Next.js, bundle más ligero, el compañero puede iterar rápido |

### Limitación conocida: sitios SPA

Cheerio no ejecuta JavaScript. Si un sitio depende 100% de client-side rendering, el HTML obtenido estará vacío o tendrá solo un `<div id="root">`. El analizador de accesibilidad técnica detecta este caso y lo reporta como hallazgo crítico, pero no puede evaluar el contenido renderizado. Esto es aceptable para v1 y se documenta como limitación.

---

## 8. Estructura final del proyecto

```
entiscore/
├── src/
│   ├── app/
│   │   ├── page.tsx
│   │   ├── layout.tsx
│   │   ├── globals.css
│   │   ├── api/
│   │   │   └── audit/
│   │   │       └── route.ts
│   │   └── components/
│   │       ├── AuditForm.tsx
│   │       ├── ScoreDisplay.tsx
│   │       ├── AxisSection.tsx
│   │       ├── ActionPlan.tsx
│   │       └── FindingCard.tsx
│   ├── agent/
│   │   ├── orchestrator.ts
│   │   ├── scoring.ts
│   │   ├── action-plan.ts
│   │   └── analyzers/
│   │       ├── structured-data.ts
│   │       ├── identity-consistency.ts
│   │       ├── authority-signals.ts
│   │       └── technical-accessibility.ts
│   ├── mcp-server/
│   │   ├── index.ts
│   │   └── tools/
│   │       ├── fetch-page.ts
│   │       ├── fetch-robots-txt.ts
│   │       └── check-url-accessibility.ts
│   └── types/
│       ├── audit.ts
│       ├── mcp-tools.ts
│       └── errors.ts
├── .kiro/
│   ├── specs/
│   │   ├── requirements.md
│   │   ├── design.md
│   │   └── tasks.md (pendiente)
│   ├── steering/
│   │   └── coding-standards.md
│   ├── hooks/
│   │   └── (hooks del proyecto)
│   └── settings/
│       └── mcp.json
├── .env.example
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

---

## 9. Variables de entorno

```env
# .env.example
# No se requieren API keys externas para v1
# Todas las operaciones usan fetch público sin autenticación

NODE_ENV=development
```

No se necesitan secrets para v1. Si en el futuro se integran APIs de terceros, se agregarían aquí.

---

## 10. Orden de implementación por prioridad

La implementación sigue el orden de prioridades definido en requirements.md:

**Bloque P0 (innegociable para la demo del 27 de julio):**

Se implementa primero el flujo completo de punta a punta con los ejes P0:

1. Tipos compartidos (`src/types/`)
2. MCP Tools (fetch_page, fetch_robots_txt, check_url_accessibility)
3. Validación de input + SSRF (`src/app/api/audit/route.ts`)
4. Analizador de datos estructurados (HU-02)
5. Analizador de accesibilidad técnica (HU-05)
6. Orquestador + scoring + plan de acción (HU-06)
7. API Route completa (HU-01)
8. Frontend: formulario + visualización de reporte (HU-07)

Al completar este bloque, el producto es demostrable de punta a punta.

**Bloque P1 (opcional, según tiempo disponible):**

Se agregan después, sin romper nada del bloque P0:

9. Analizador de consistencia de identidad (HU-03, versión simplificada si el tiempo aprieta)
10. Analizador de señales de autoridad (HU-04, versión simplificada si el tiempo aprieta)

Los analizadores P1 se conectan al orquestador con el mismo contrato que los P0. Si no se implementan, el orquestador devuelve `status: "partial"` para esos ejes con un mensaje indicando que no fueron evaluados en esta versión.

---

## 11. Plan de despliegue

1. Push a GitHub (rama `main`)
2. Conectar repo a Vercel (auto-deploy en cada push)
3. Vercel detecta Next.js automáticamente; no requiere configuración adicional
4. Las MCP tools corren como funciones normales dentro de la API route; no hay infraestructura adicional

Tiempo estimado de setup de deploy: < 10 minutos.
