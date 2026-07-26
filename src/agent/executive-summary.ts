import Anthropic from "@anthropic-ai/sdk";
import type { AxisResult } from "@/types";

const CLAUDE_MODEL = "claude-haiku-4-5-20251001";
const CLAUDE_TIMEOUT_MS = 8_000;
const CLAUDE_MAX_TOKENS = 300;

interface AxesForSummary {
  structuredData: AxisResult;
  identityConsistency: AxisResult;
  authoritySignals: AxisResult;
  technicalAccessibility: AxisResult;
}

function isAnthropicKeyConfigured(): boolean {
  return typeof process.env["ANTHROPIC_API_KEY"] === "string" && process.env["ANTHROPIC_API_KEY"].length > 0;
}

function buildSummaryPrompt(url: string, overallScore: number, axes: AxesForSummary): string {
  const axesSummary = [
    `Datos estructurados: ${axes.structuredData.score}/100`,
    `Consistencia de identidad: ${axes.identityConsistency.score}/100`,
    `Señales de autoridad: ${axes.authoritySignals.score}/100`,
    `Accesibilidad técnica: ${axes.technicalAccessibility.score}/100`,
  ].join("\n");

  return `Redacta un resumen ejecutivo de un párrafo (3 a 4 oraciones) sobre el estado de la presencia digital de ${url}, que obtuvo ${overallScore}/100 como puntaje general.

Scores por eje:
${axesSummary}

Reglas:
- Describe el estado general, menciona las fortalezas principales y las áreas de mejora más importantes.
- Tono claro y no técnico, accesible para alguien sin conocimientos de SEO.
- No uses emojis.
- No uses guiones medios ni em dash.
- Responde solo con el párrafo de resumen, sin encabezados ni formato adicional.`;
}

async function executeWithTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) => {
    const timer = setTimeout(() => {
      clearTimeout(timer);
      reject(new Error("TIMEOUT"));
    }, timeoutMs);
  });

  return Promise.race([promise, timeoutPromise]);
}

export async function generateExecutiveSummary(
  url: string,
  overallScore: number,
  axes: AxesForSummary,
  locale: "es" | "en" = "es"
): Promise<string | undefined> {
  if (!isAnthropicKeyConfigured()) return undefined;

  try {
    const client = new Anthropic();
    const prompt = buildSummaryPrompt(url, overallScore, axes);
    const languageInstruction = locale === "en" ? "\n\nIMPORTANT: Write the summary in English." : "";

    const responsePromise = client.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: CLAUDE_MAX_TOKENS,
      messages: [{ role: "user", content: prompt + languageInstruction }],
    });

    const response = await executeWithTimeout(responsePromise, CLAUDE_TIMEOUT_MS);

    const textBlock = response.content.find((block) => block.type === "text");
    if (!textBlock || textBlock.type !== "text") return undefined;

    return textBlock.text.trim();
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Error desconocido";
    console.error(`[Entiscore] Fallback: resumen ejecutivo no generado. Motivo: ${errorMessage}`);
    return undefined;
  }
}
