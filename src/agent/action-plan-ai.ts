import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import type { AxisResult, AxisName, ActionItem, Finding } from "@/types";
import { generateActionPlan as generateRuleBasedActionPlan } from "@/agent/action-plan";

const CLAUDE_MODEL = "claude-haiku-4-5-20251001";
const CLAUDE_TIMEOUT_MS = 15_000;
const CLAUDE_MAX_TOKENS = 3000;

const AXIS_LABELS: Record<AxisName, string> = {
  structuredData: "Datos estructurados",
  identityConsistency: "Consistencia de identidad",
  authoritySignals: "Señales de autoridad",
  technicalAccessibility: "Accesibilidad técnica",
};

const ActionItemSchema = z.object({
  priority: z.number(),
  title: z.string(),
  reason: z.string(),
  effort: z.enum(["bajo", "medio", "alto"]),
  axis: z.enum(["structuredData", "identityConsistency", "authoritySignals", "technicalAccessibility"]),
  codeSnippet: z.string().optional(),
  codeLanguage: z.string().optional(),
});

const ActionPlanResponseSchema = z.array(ActionItemSchema);

interface AxesForPlan {
  structuredData: AxisResult;
  identityConsistency: AxisResult;
  authoritySignals: AxisResult;
  technicalAccessibility: AxisResult;
}

function extractActionableFindings(axes: AxesForPlan): { axis: AxisName; finding: Finding }[] {
  const actionable: { axis: AxisName; finding: Finding }[] = [];
  const axisEntries: [AxisName, AxisResult][] = [
    ["structuredData", axes.structuredData],
    ["identityConsistency", axes.identityConsistency],
    ["authoritySignals", axes.authoritySignals],
    ["technicalAccessibility", axes.technicalAccessibility],
  ];

  for (const [axisName, result] of axisEntries) {
    for (const finding of result.findings) {
      if (finding.type === "warning" || finding.type === "critical") {
        actionable.push({ axis: axisName, finding });
      }
    }
  }

  return actionable;
}

function buildPromptForClaude(actionableFindings: { axis: AxisName; finding: Finding }[]): string {
  const findingsSummary = actionableFindings
    .map((item) => `[${item.finding.type.toUpperCase()}] (${AXIS_LABELS[item.axis]}) ${item.finding.title}: ${item.finding.description}`)
    .join("\n");

  return `Eres un consultor experto en presencia digital y SEO técnico. Analizaste un sitio web y encontraste los siguientes problemas:

${findingsSummary}

Genera un plan de acción priorizado con recomendaciones concretas. Cada recomendación debe:
- Tener un título claro y accionable
- Explicar el motivo con profundidad pero en lenguaje accesible para alguien no técnico
- Indicar el nivel de esfuerzo (bajo, medio, alto)
- Indicar el eje de origen (structuredData, identityConsistency, authoritySignals, technicalAccessibility)
- Estar numerada por prioridad (1 = más urgente)
- Si es posible generar un snippet de código que resuelva directamente el problema (por ejemplo un bloque JSON-LD, meta tags, o un fragmento HTML), incluirlo en el campo "codeSnippet" con el lenguaje en "codeLanguage" (html, json, etc.). Si no aplica código para esa recomendación, omitir esos campos.

Responde ÚNICAMENTE con un array JSON válido siguiendo este formato exacto, sin texto adicional antes o después:
[{"priority":1,"title":"...","reason":"...","effort":"bajo|medio|alto","axis":"...","codeSnippet":"...","codeLanguage":"html"}]

Genera entre 3 y 8 recomendaciones, ordenadas de mayor a menor impacto.`;
}

function isAnthropicKeyConfigured(): boolean {
  return typeof process.env["ANTHROPIC_API_KEY"] === "string" && process.env["ANTHROPIC_API_KEY"].length > 0;
}

async function callClaudeForActionPlan(prompt: string): Promise<ActionItem[]> {
  const client = new Anthropic();

  const response = await client.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: CLAUDE_MAX_TOKENS,
    messages: [{ role: "user", content: prompt }],
  });

  const textBlock = response.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("Claude no devolvió contenido de texto");
  }

  const rawJson = textBlock.text.trim();
  const parsed: unknown = JSON.parse(rawJson);
  const validated = ActionPlanResponseSchema.parse(parsed);

  return validated;
}

async function executeWithTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) => {
    const timer = setTimeout(() => {
      clearTimeout(timer);
      reject(new Error("CLAUDE_TIMEOUT"));
    }, timeoutMs);
  });

  return Promise.race([promise, timeoutPromise]);
}

export async function generateSmartActionPlan(axes: AxesForPlan, locale: "es" | "en" = "es"): Promise<ActionItem[]> {
  if (!isAnthropicKeyConfigured()) {
    return generateRuleBasedActionPlan(axes);
  }

  const actionableFindings = extractActionableFindings(axes);

  if (actionableFindings.length === 0) {
    return generateRuleBasedActionPlan(axes);
  }

  try {
    const prompt = buildPromptForClaude(actionableFindings);
    const languageInstruction = locale === "en" ? "\n\nIMPORTANT: Write all content in English." : "";
    const aiPlan = await executeWithTimeout(callClaudeForActionPlan(prompt + languageInstruction), CLAUDE_TIMEOUT_MS);
    return aiPlan;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Error desconocido";
    console.error(`[Entiscore] Fallback a reglas fijas para plan de acción. Motivo: ${errorMessage}`);
    return generateRuleBasedActionPlan(axes);
  }
}
