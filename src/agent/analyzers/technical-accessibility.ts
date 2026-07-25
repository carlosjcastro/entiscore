import * as cheerio from "cheerio";
import type { Analyzer, AnalysisContext, AxisResult, Finding } from "@/types";

const MAX_ACCEPTABLE_RESPONSE_TIME_MS = 5000;
const MIN_VISIBLE_TEXT_LENGTH_FOR_SSR = 100;

const ESSENTIAL_METADATA_SELECTORS: Record<string, string> = {
  title: "title",
  "meta description": 'meta[name="description"]',
  "og:title": 'meta[property="og:title"]',
  "og:description": 'meta[property="og:description"]',
  "og:image": 'meta[property="og:image"]',
};

const SCORE_PENALTY_PER_MISSING_META = 10;
const SCORE_PENALTY_SLOW_RESPONSE = 15;
const SCORE_PENALTY_NON_SUCCESS_STATUS = 30;
const SCORE_PENALTY_ROBOTS_BLOCKS_ALL = 25;
const SCORE_PENALTY_SPA_NO_CONTENT = 30;

function evaluateHttpResponse(
  statusCode: number,
  responseTimeMs: number
): Finding[] {
  const findings: Finding[] = [];

  if (statusCode < 200 || statusCode >= 300) {
    findings.push({
      type: "critical",
      title: "El sitio no responde con un código HTTP exitoso",
      description: `El servidor respondió con código ${statusCode}, lo cual impide que crawlers indexen el contenido correctamente.`,
    });
  } else {
    findings.push({
      type: "positive",
      title: "Respuesta HTTP exitosa",
      description: `El servidor respondió con código ${statusCode}.`,
    });
  }

  if (responseTimeMs > MAX_ACCEPTABLE_RESPONSE_TIME_MS) {
    findings.push({
      type: "warning",
      title: "Tiempo de respuesta elevado",
      description: `El sitio tardó ${responseTimeMs}ms en responder, lo cual supera el umbral recomendado de ${MAX_ACCEPTABLE_RESPONSE_TIME_MS}ms. Esto puede afectar la experiencia de crawlers con timeouts ajustados.`,
    });
  } else {
    findings.push({
      type: "positive",
      title: "Tiempo de respuesta aceptable",
      description: `El sitio respondió en ${responseTimeMs}ms.`,
    });
  }

  return findings;
}

function evaluateEssentialMetadata(html: string): Finding[] {
  const $ = cheerio.load(html);
  const findings: Finding[] = [];

  for (const [metaName, selector] of Object.entries(ESSENTIAL_METADATA_SELECTORS)) {
    const element = $(selector).first();
    const hasContent = metaName === "title"
      ? element.text().trim().length > 0
      : (element.attr("content") ?? "").trim().length > 0;

    if (element.length === 0 || !hasContent) {
      findings.push({
        type: "warning",
        title: `Metadato faltante: ${metaName}`,
        description: `No se encontró ${metaName} o su valor está vacío. Este metadato es importante para que buscadores e IA muestren información correcta sobre el sitio.`,
      });
    } else {
      findings.push({
        type: "positive",
        title: `Metadato presente: ${metaName}`,
        description: `El metadato ${metaName} está correctamente definido.`,
      });
    }
  }

  return findings;
}

function robotsTxtBlocksRelevantContent(robotsTxt: string | null): Finding[] {
  if (robotsTxt === null) {
    return [
      {
        type: "positive",
        title: "Sin restricciones en robots.txt",
        description:
          "No se encontró un archivo robots.txt, lo cual significa que no hay restricciones declaradas para crawlers.",
      },
    ];
  }

  const lines = robotsTxt.split("\n").map((line) => line.trim().toLowerCase());
  const disallowAllPattern = "disallow: /";
  let appliesToGenericAgent = false;
  let blocksAll = false;

  for (const line of lines) {
    if (line.startsWith("user-agent:")) {
      const agent = line.replace("user-agent:", "").trim();
      appliesToGenericAgent = agent === "*";
    }

    if (appliesToGenericAgent && line === disallowAllPattern) {
      blocksAll = true;
    }
  }

  if (blocksAll) {
    return [
      {
        type: "critical",
        title: "robots.txt bloquea todo el sitio para crawlers genéricos",
        description:
          "La directiva Disallow: / para User-agent: * impide que buscadores e IA accedan al contenido del sitio. Esto bloquea completamente la visibilidad.",
      },
    ];
  }

  return [
    {
      type: "positive",
      title: "robots.txt no bloquea contenido relevante",
      description:
        "El archivo robots.txt existe y no impide el acceso general de crawlers al contenido principal.",
    },
  ];
}

function detectSpaWithoutServerRendering(html: string): Finding[] {
  const $ = cheerio.load(html);
  const bodyText = $("body").text().replace(/\s+/g, " ").trim();

  if (bodyText.length < MIN_VISIBLE_TEXT_LENGTH_FOR_SSR) {
    return [
      {
        type: "critical",
        title: "El sitio parece depender exclusivamente de JavaScript del lado del cliente",
        description: `El contenido visible del body tiene solo ${bodyText.length} caracteres de texto. Esto sugiere que el sitio es una SPA sin server side rendering, lo cual dificulta que crawlers e IA accedan al contenido real.`,
        details:
          "Se recomienda implementar Server Side Rendering (SSR) o Static Site Generation (SSG) para que el contenido sea accesible sin ejecutar JavaScript.",
      },
    ];
  }

  return [
    {
      type: "positive",
      title: "Contenido visible sin necesidad de JavaScript",
      description: `El body contiene ${bodyText.length} caracteres de texto accesible para crawlers sin ejecutar JavaScript.`,
    },
  ];
}

function calculateScore(findings: Finding[]): number {
  let score = 100;

  const missingMetaCount = findings.filter(
    (f) => f.type === "warning" && f.title.startsWith("Metadato faltante")
  ).length;
  score -= missingMetaCount * SCORE_PENALTY_PER_MISSING_META;

  const hasSlowResponse = findings.some(
    (f) => f.type === "warning" && f.title === "Tiempo de respuesta elevado"
  );
  if (hasSlowResponse) score -= SCORE_PENALTY_SLOW_RESPONSE;

  const hasNonSuccessStatus = findings.some(
    (f) => f.type === "critical" && f.title === "El sitio no responde con un código HTTP exitoso"
  );
  if (hasNonSuccessStatus) score -= SCORE_PENALTY_NON_SUCCESS_STATUS;

  const hasRobotsBlock = findings.some(
    (f) =>
      f.type === "critical" &&
      f.title === "robots.txt bloquea todo el sitio para crawlers genéricos"
  );
  if (hasRobotsBlock) score -= SCORE_PENALTY_ROBOTS_BLOCKS_ALL;

  const hasSpaIssue = findings.some(
    (f) =>
      f.type === "critical" &&
      f.title.startsWith("El sitio parece depender exclusivamente")
  );
  if (hasSpaIssue) score -= SCORE_PENALTY_SPA_NO_CONTENT;

  return Math.max(0, Math.min(100, score));
}

export const technicalAccessibilityAnalyzer: Analyzer = {
  async analyze(context: AnalysisContext): Promise<AxisResult> {
    const findings: Finding[] = [];

    findings.push(
      ...evaluateHttpResponse(context.statusCode, context.responseTimeMs)
    );
    findings.push(...evaluateEssentialMetadata(context.html));
    findings.push(...robotsTxtBlocksRelevantContent(context.robotsTxt));
    findings.push(...detectSpaWithoutServerRendering(context.html));

    const score = calculateScore(findings);

    return { score, status: "evaluated", findings };
  },
};
