# Entiscore: Auditor de Entidad Digital

Entiscore analiza la presencia digital de una persona o proyecto a partir de su URL y genera un reporte claro sobre que tan reconocible es esa entidad para buscadores e inteligencia artificial. El reporte incluye un puntaje general, hallazgos por eje de evaluacion y un plan de accion priorizado.

## Problema que resuelve

Desarrolladores, freelancers y profesionales tienen presencia online (portfolios, perfiles, sitios web) pero no saben si esa presencia esta optimizada para ser interpretada correctamente por motores de busqueda y sistemas de IA. Entiscore les da un diagnostico claro y accionable sin necesidad de conocimientos tecnicos de SEO.

## Demo en linea

**URL:** https://entiscore.vercel.app

## Ejes de evaluacion

El agente evalua cuatro dimensiones al analizar una URL:

1. **Datos estructurados:** presencia y calidad de schema markup (JSON-LD, Microdata, RDFa)
2. **Accesibilidad tecnica:** metadatos esenciales, robots.txt, tiempo de respuesta, deteccion de SPA sin SSR
3. **Consistencia de identidad:** coherencia del nombre y perfiles entre fuentes (fase posterior)
4. **Senales de autoridad:** enlaces a plataformas reconocidas y metadata de autoria (fase posterior)

## Stack tecnologico

| Componente | Tecnologia |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| Lenguaje | TypeScript (strict mode) |
| HTML Parsing | Cheerio |
| Validacion | Zod |
| UI | React + Tailwind CSS 4 |
| Iconos | react-icons |
| Deploy | Vercel |

## Correr en local

```bash
git clone https://github.com/carlosjcastro/entiscore.git
cd entiscore
npm install
npm run dev
```

El proyecto levanta en `http://localhost:3000`. No requiere variables de entorno ni API keys externas.

## Arquitectura

```
src/
├── app/              Presentacion (Next.js App Router)
│   ├── api/audit/    Endpoint POST /api/audit
│   └── components/   Componentes React del reporte
├── agent/            Logica del agente
│   ├── orchestrator  Coordinacion del analisis
│   ├── scoring       Calculo de puntaje ponderado
│   ├── action-plan   Generacion de recomendaciones
│   └── analyzers/    Analizadores por eje
├── mcp-server/       MCP tools (funciones de I/O de red)
│   └── tools/        fetchPage, fetchRobotsTxt, checkUrlAccessibility
└── types/            Interfaces TypeScript compartidas
```

El agente no ejecuta I/O directamente. Toda operacion de red se encapsula en MCP tools con contratos tipados, lo que mantiene la separacion entre logica de decision y ejecucion de operaciones externas. La arquitectura esta preparada para exponerse como servidor MCP real si se despliega como proceso separado.

## Uso de Kiro en el desarrollo

Este proyecto se construyo integramente usando Kiro como copiloto de desarrollo, demostrando sus capacidades en todo el flujo:

### Specs (Spec Driven Development)

Se generaron tres documentos antes de escribir cualquier linea de codigo:

- `.kiro/specs/requirements.md`: historias de usuario con criterios de aceptacion, prioridades P0/P1
- `.kiro/specs/design.md`: arquitectura, contrato del endpoint, integracion MCP, separacion de capas
- `.kiro/specs/tasks.md`: desglose de tareas ejecutables con dependencias y estimaciones

### Steering

El archivo `.kiro/steering/coding-standards.md` define los estandares que Kiro aplica automaticamente a todo el codigo generado: sin comentarios, nombres autodescriptivos, tipado estricto, una responsabilidad por funcion, separacion de capas, y convencion de commits.

### Hooks

El hook `.kiro/hooks/typecheck-on-save.json` ejecuta `npx tsc --noEmit` automaticamente al guardar cualquier archivo TypeScript, garantizando que el proyecto compila sin errores en todo momento.

### MCP Tools

Las herramientas de acceso a red (`fetchPage`, `fetchRobotsTxt`, `checkUrlAccessibility`) se implementaron siguiendo el contrato MCP con schemas Zod de input/output. Existe un servidor MCP de referencia en `src/mcp-server/index.ts` que expone estas mismas funciones para uso con Kiro IDE durante el desarrollo.

## Seguridad

El endpoint `/api/audit` incluye proteccion contra SSRF: valida que la URL no resuelva a localhost, IPs privadas (127.x, 10.x, 172.16-31.x, 192.168.x, 169.254.x) ni loopback IPv6 antes de ejecutar cualquier operacion de red.

## Equipo

| Rol | Responsabilidad |
|---|---|
| Backend | Logica del agente, MCP tools, API, specs, integracion con Kiro |
| Frontend | Interfaz de usuario, experiencia visual del reporte |

## Licencia

MIT
