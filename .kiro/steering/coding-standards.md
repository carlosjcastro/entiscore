---
inclusion: always
---

# Entiscore: Estándares de código

Estos estándares se aplican a todo el código generado en este proyecto sin excepción.

## Prohibición absoluta de comentarios

No se permite ningún comentario dentro del código en ningún archivo del proyecto. Ni comentarios de línea, ni comentarios de bloque, ni JSDoc, ni TODO, ni FIXME. Los nombres de variables, funciones, tipos y componentes deben ser lo suficientemente explícitos para que el código se explique solo.

## Nombres autodescriptivos

Todas las variables, funciones, componentes, interfaces, tipos y enums deben tener nombres que comuniquen con precisión su propósito. Un nombre correcto elimina la necesidad de cualquier comentario. Preferir nombres largos y claros sobre nombres cortos y ambiguos.

## Tipado estricto de punta a punta

TypeScript strict mode está habilitado. No se permite el uso de `any` bajo ninguna circunstancia. No se permiten aserciones de tipo (`as`) salvo casos estrictamente justificados donde no existe alternativa viable. Todos los parámetros, retornos de función e interfaces deben estar explícitamente tipados.

## Una sola responsabilidad por función

Cada función hace exactamente una cosa. Ninguna función supera las 30 líneas de lógica. Si una función necesita hacer más de una cosa, se divide en funciones más pequeñas con nombres que describan cada responsabilidad individual.

## Separación estricta entre capas

La lógica del agente (src/agent/) no ejecuta operaciones de I/O directamente. La capa de presentación (src/app/components/) no contiene lógica de negocio. Las MCP tools (src/mcp-server/tools/) son las únicas funciones que ejecutan operaciones de red. Los analizadores reciben datos ya obtenidos y las tools como dependencia inyectada.

## Manejo explícito de errores

Cada punto de integración externa tiene manejo explícito de errores con timeouts configurados. No se permiten fallos silenciosos. Los errores se capturan, se tipan y se propagan de forma controlada.

## Estilo de escritura en textos visibles

No se usan guiones medios ni em dash en textos visibles de la interfaz, del README ni de ningún contenido orientado al usuario. Se prefieren comas, puntos o reestructuración de la oración.

## Formato de código

Se usa el formato estándar de Prettier con la configuración por defecto de Next.js. Imports organizados: primeros los de librerías externas, luego los internos del proyecto agrupados por capa.
