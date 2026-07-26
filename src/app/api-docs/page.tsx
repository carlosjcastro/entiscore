import Link from "next/link";
import type { Metadata } from "next";
import { HiArrowLeft } from "react-icons/hi2";

export const metadata: Metadata = {
  title: "Documentación de la API",
  description: "Cómo integrar el endpoint POST /api/audit de Entiscore en scripts, pipelines de CI o herramientas internas.",
  alternates: { canonical: "https://entiscore.vercel.app/api-docs" },
};

function CodeBlock({ code, language }: { code: string; language: string }) {
  return (
    <div className="relative mt-3 mb-4">
      <div className="flex items-center px-3 py-1.5 bg-zinc-800 dark:bg-zinc-950 rounded-t border border-zinc-700 border-b-0">
        <span className="text-[10px] font-medium text-zinc-400 uppercase">{language}</span>
      </div>
      <pre className="overflow-x-auto px-4 py-3 bg-zinc-900 dark:bg-zinc-950 rounded-b border border-zinc-700 border-t-0 text-[12px] leading-relaxed text-zinc-200">
        <code>{code}</code>
      </pre>
    </div>
  );
}

const CURL_EXAMPLE = `curl -X POST https://entiscore.vercel.app/api/audit \\
  -H "Content-Type: application/json" \\
  -d '{"url": "https://example.com"}'`;

const FETCH_EXAMPLE = `const response = await fetch("https://entiscore.vercel.app/api/audit", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ url: "https://example.com" }),
});

const report = await response.json();
console.log(report.overallScore);
console.log(report.maturityLevel);
console.log(report.actionPlan);`;

const RESPONSE_SHAPE = `{
  "url": "https://example.com",
  "timestamp": "2026-07-25T16:00:00.000Z",
  "overallScore": 42,
  "maturityLevel": "medio",
  "executiveSummary": "El sitio tiene una base técnica aceptable...",
  "axes": {
    "structuredData": {
      "score": 0,
      "status": "evaluated",
      "findings": [
        {
          "type": "critical",
          "title": "No se encontró schema markup en el sitio",
          "description": "..."
        }
      ]
    },
    "identityConsistency": { "score": 50, "status": "evaluated", "findings": [...] },
    "authoritySignals": { "score": 30, "status": "evaluated", "findings": [...] },
    "technicalAccessibility": { "score": 60, "status": "evaluated", "findings": [...] }
  },
  "actionPlan": [
    {
      "priority": 1,
      "title": "Agregar schema markup de tipo Person",
      "reason": "...",
      "effort": "medio",
      "axis": "structuredData",
      "codeSnippet": "<script type=\\"application/ld+json\\">...</script>",
      "codeLanguage": "html"
    }
  ],
  "code": "bold-key-742",
  "siteName": "Example Domain",
  "faviconUrl": "https://example.com/favicon.ico"
}`;

const ERROR_SHAPE = `{
  "error": "La URL proporcionada no es válida",
  "code": "INVALID_URL",
  "details": "url: Invalid URL"
}`;

export default function ApiDocsPage() {
  return (
    <main className="flex-1 px-4 py-12 sm:py-16 sm:px-6 lg:px-8 bg-zinc-50 dark:bg-zinc-900 min-h-screen">
      <div className="mx-auto w-full max-w-3xl">
        <div className="flex items-center gap-3 mb-12">
          <Link
            href="/"
            className="flex h-8 w-8 items-center justify-center rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-700"
          >
            <HiArrowLeft className="h-4 w-4" />
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-zinc-800 dark:text-zinc-100">
            Documentación de la API
          </h1>
        </div>

        <div className="flex flex-col gap-10 text-[14px] leading-relaxed text-zinc-600 dark:text-zinc-400">
          <section>
            <p>
              Entiscore expone su análisis como un endpoint HTTP simple que cualquier desarrollador puede consumir directamente, sin necesidad de usar la interfaz web. Es útil para integrarlo en scripts propios, pipelines de integración continua, o herramientas internas de un equipo.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200 mb-3">
              POST /api/audit
            </h2>
            <p className="mb-2">
              Analiza una URL y devuelve un reporte completo de entidad digital con puntaje, hallazgos por eje y plan de acción.
            </p>

            <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mt-6 mb-1">Request</h3>
            <CodeBlock
              language="json"
              code={`POST /api/audit
Content-Type: application/json

{
  "url": "https://tu-sitio.com"
}`}
            />

            <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mt-6 mb-1">Response (200)</h3>
            <p className="mb-1 text-[13px]">Reporte completo con la estructura AuditResponse:</p>
            <CodeBlock language="json" code={RESPONSE_SHAPE} />

            <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mt-6 mb-1">Campos principales</h3>
            <div className="flex flex-col gap-1 text-[13px] pl-4 border-l border-zinc-200 dark:border-zinc-700">
              <p><span className="font-medium text-zinc-700 dark:text-zinc-300">overallScore:</span> Puntaje general de 0 a 100.</p>
              <p><span className="font-medium text-zinc-700 dark:text-zinc-300">maturityLevel:</span> bajo, medio, alto o excelente.</p>
              <p><span className="font-medium text-zinc-700 dark:text-zinc-300">axes:</span> Resultado por cada eje (score, status, findings).</p>
              <p><span className="font-medium text-zinc-700 dark:text-zinc-300">actionPlan:</span> Recomendaciones priorizadas con código de solución opcional.</p>
              <p><span className="font-medium text-zinc-700 dark:text-zinc-300">code:</span> Código único para acceder al reporte via /r/[codigo].</p>
              <p><span className="font-medium text-zinc-700 dark:text-zinc-300">executiveSummary:</span> Resumen narrativo generado por IA (opcional).</p>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200 mb-3">
              Errores
            </h2>
            <div className="flex flex-col gap-3 text-[13px]">
              <div className="flex flex-col gap-1 pl-4 border-l border-zinc-200 dark:border-zinc-700">
                <p><span className="font-medium text-zinc-700 dark:text-zinc-300">400 INVALID_URL:</span> La URL tiene formato inválido o no usa protocolo http/https.</p>
                <p><span className="font-medium text-zinc-700 dark:text-zinc-300">403 FORBIDDEN_URL:</span> La URL apunta a localhost, una IP privada o un rango reservado.</p>
                <p><span className="font-medium text-zinc-700 dark:text-zinc-300">504 TIMEOUT:</span> El análisis superó el tiempo máximo de 55 segundos.</p>
                <p><span className="font-medium text-zinc-700 dark:text-zinc-300">500 INTERNAL_ERROR:</span> Error inesperado del servidor.</p>
              </div>
            </div>
            <CodeBlock language="json" code={ERROR_SHAPE} />
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200 mb-3">
              Ejemplo con curl
            </h2>
            <CodeBlock language="bash" code={CURL_EXAMPLE} />
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200 mb-3">
              Ejemplo con fetch (JavaScript)
            </h2>
            <CodeBlock language="javascript" code={FETCH_EXAMPLE} />
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200 mb-3">
              Autenticación y seguridad
            </h2>
            <p>
              El endpoint no requiere autenticación ni API key en esta versión. Está pensado como una herramienta abierta para la comunidad de desarrolladores. Las mismas protecciones de seguridad que aplican desde la interfaz web, como el bloqueo de URLs privadas y localhost, se aplican también a las llamadas directas al endpoint.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
