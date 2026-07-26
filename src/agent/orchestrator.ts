import type { AnalysisContext, AuditResponse, AxisResult, McpTools } from "@/types";
import { fetchPage, fetchRobotsTxt, checkUrlAccessibility } from "@/mcp-server/tools";
import { structuredDataAnalyzer } from "@/agent/analyzers/structured-data";
import { technicalAccessibilityAnalyzer } from "@/agent/analyzers/technical-accessibility";
import { identityConsistencyAnalyzer } from "@/agent/analyzers/identity-consistency";
import { authoritySignalsAnalyzer } from "@/agent/analyzers/authority-signals";
import { calculateOverallScore } from "@/agent/scoring";
import { generateSmartActionPlan } from "@/agent/action-plan-ai";
import { generateExecutiveSummary } from "@/agent/executive-summary";

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

interface AllAxesResults {
  structuredData: AxisResult;
  identityConsistency: AxisResult;
  authoritySignals: AxisResult;
  technicalAccessibility: AxisResult;
}

async function runAllAnalyzers(context: AnalysisContext): Promise<AllAxesResults> {
  const [
    structuredDataResult,
    technicalAccessibilityResult,
    identityConsistencyResult,
    authoritySignalsResult,
  ] = await Promise.allSettled([
    executeAnalyzerSafely(() => structuredDataAnalyzer.analyze(context)),
    executeAnalyzerSafely(() => technicalAccessibilityAnalyzer.analyze(context)),
    executeAnalyzerSafely(() => identityConsistencyAnalyzer.analyze(context)),
    executeAnalyzerSafely(() => authoritySignalsAnalyzer.analyze(context)),
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
    identityConsistency:
      identityConsistencyResult.status === "fulfilled"
        ? identityConsistencyResult.value
        : buildFailedAxisResult("El analizador de consistencia de identidad falló inesperadamente"),
    authoritySignals:
      authoritySignalsResult.status === "fulfilled"
        ? authoritySignalsResult.value
        : buildFailedAxisResult("El analizador de señales de autoridad falló inesperadamente"),
  };
}

async function buildAuditResponse(url: string, axes: AllAxesResults): Promise<AuditResponse> {
  const { overallScore, maturityLevel } = calculateOverallScore(axes);
  const [actionPlan, executiveSummary] = await Promise.all([
    generateSmartActionPlan(axes),
    generateExecutiveSummary(url, overallScore, axes),
  ]);

  return {
    url,
    timestamp: new Date().toISOString(),
    overallScore,
    maturityLevel,
    executiveSummary,
    axes,
    actionPlan,
  };
}

export interface AuditResult {
  report: AuditResponse;
  html: string;
}

export async function runAudit(url: string): Promise<AuditResponse> {
  const result = await runAuditWithMetadata(url);
  return result.report;
}

export async function runAuditWithMetadata(url: string): Promise<AuditResult> {
  const siteData = await fetchSiteData(url);
  const context = buildAnalysisContext(url, siteData);
  const axesResults = await runAllAnalyzers(context);
  const report = await buildAuditResponse(url, axesResults);
  return { report, html: siteData.html };
}
