import type { AnalysisContext, AuditResponse, AxisResult, McpTools } from "@/types";
import { fetchPage, fetchRobotsTxt, checkUrlAccessibility } from "@/mcp-server/tools";
import { structuredDataAnalyzer } from "@/agent/analyzers/structured-data";
import { technicalAccessibilityAnalyzer } from "@/agent/analyzers/technical-accessibility";
import { calculateOverallScore } from "@/agent/scoring";
import { generateActionPlan } from "@/agent/action-plan";

function buildPartialAxisResult(message: string): AxisResult {
  return {
    score: 0,
    status: "partial",
    findings: [
      {
        type: "warning",
        title: "Eje no evaluado en esta versión",
        description: message,
      },
    ],
  };
}

function buildFailedAxisResult(errorMessage: string): AxisResult {
  return {
    score: 0,
    status: "failed",
    findings: [
      {
        type: "critical",
        title: "Error durante el análisis de este eje",
        description: errorMessage,
      },
    ],
  };
}

function extractBaseUrl(url: string): string {
  const parsed = new URL(url);
  return parsed.origin;
}

async function fetchSiteData(url: string): Promise<{
  html: string;
  statusCode: number;
  responseTimeMs: number;
  headers: Record<string, string>;
  robotsTxt: string | null;
}> {
  const [pageResult, robotsResult] = await Promise.all([
    fetchPage({ url }),
    fetchRobotsTxt({ baseUrl: extractBaseUrl(url) }),
  ]);

  return {
    html: pageResult.html,
    statusCode: pageResult.statusCode,
    responseTimeMs: pageResult.responseTimeMs,
    headers: pageResult.headers,
    robotsTxt: robotsResult.content,
  };
}

function buildAnalysisContext(
  url: string,
  siteData: {
    html: string;
    statusCode: number;
    responseTimeMs: number;
    headers: Record<string, string>;
    robotsTxt: string | null;
  }
): AnalysisContext {
  const tools: McpTools = {
    fetchPage,
    fetchRobotsTxt,
    checkUrlAccessibility,
  };

  return {
    url,
    html: siteData.html,
    statusCode: siteData.statusCode,
    responseTimeMs: siteData.responseTimeMs,
    headers: siteData.headers,
    robotsTxt: siteData.robotsTxt,
    tools,
  };
}

async function executeAnalyzerSafely(
  analyzerFn: () => Promise<AxisResult>
): Promise<AxisResult> {
  try {
    return await analyzerFn();
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Error desconocido durante el análisis";
    return buildFailedAxisResult(errorMessage);
  }
}

async function runP0Analyzers(
  context: AnalysisContext
): Promise<{ structuredData: AxisResult; technicalAccessibility: AxisResult }> {
  const [structuredDataResult, technicalAccessibilityResult] = await Promise.allSettled([
    executeAnalyzerSafely(() => structuredDataAnalyzer.analyze(context)),
    executeAnalyzerSafely(() => technicalAccessibilityAnalyzer.analyze(context)),
  ]);

  return {
    structuredData:
      structuredDataResult.status === "fulfilled"
        ? structuredDataResult.value
        : buildFailedAxisResult("El analizador de datos estructurados falló inesperadamente"),
    technicalAccessibility:
      technicalAccessibilityResult.status === "fulfilled"
        ? technicalAccessibilityResult.value
        : buildFailedAxisResult("El analizador de accesibilidad técnica falló inesperadamente"),
  };
}

function buildP1PlaceholderResults(): {
  identityConsistency: AxisResult;
  authoritySignals: AxisResult;
} {
  return {
    identityConsistency: buildPartialAxisResult(
      "El análisis de consistencia de identidad se agregará en una fase posterior del desarrollo."
    ),
    authoritySignals: buildPartialAxisResult(
      "El análisis de señales de autoridad se agregará en una fase posterior del desarrollo."
    ),
  };
}

function buildAuditResponse(
  url: string,
  axes: {
    structuredData: AxisResult;
    identityConsistency: AxisResult;
    authoritySignals: AxisResult;
    technicalAccessibility: AxisResult;
  }
): AuditResponse {
  const { overallScore, maturityLevel } = calculateOverallScore(axes);
  const actionPlan = generateActionPlan(axes);

  return {
    url,
    timestamp: new Date().toISOString(),
    overallScore,
    maturityLevel,
    axes,
    actionPlan,
  };
}

export async function runAudit(url: string): Promise<AuditResponse> {
  const siteData = await fetchSiteData(url);
  const context = buildAnalysisContext(url, siteData);

  const p0Results = await runP0Analyzers(context);
  const p1Results = buildP1PlaceholderResults();

  const allAxes = {
    structuredData: p0Results.structuredData,
    identityConsistency: p1Results.identityConsistency,
    authoritySignals: p1Results.authoritySignals,
    technicalAccessibility: p0Results.technicalAccessibility,
  };

  return buildAuditResponse(url, allAxes);
}
