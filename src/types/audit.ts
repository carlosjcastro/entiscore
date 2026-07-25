import type {
  FetchPageOutput,
  FetchRobotsTxtOutput,
  CheckUrlAccessibilityInput,
  CheckUrlAccessibilityOutput,
} from "./mcp-tools";

export type FindingType = "positive" | "warning" | "critical";

export interface Finding {
  type: FindingType;
  title: string;
  description: string;
  details?: string;
}

export type AxisStatus = "evaluated" | "partial" | "failed";

export interface AxisResult {
  score: number;
  status: AxisStatus;
  findings: Finding[];
}

export type MaturityLevel = "bajo" | "medio" | "alto" | "excelente";

export type AxisName =
  | "structuredData"
  | "identityConsistency"
  | "authoritySignals"
  | "technicalAccessibility";

export type EffortLevel = "bajo" | "medio" | "alto";

export interface ActionItem {
  priority: number;
  title: string;
  reason: string;
  effort: EffortLevel;
  axis: AxisName;
}

export interface AuditResponse {
  url: string;
  timestamp: string;
  overallScore: number;
  maturityLevel: MaturityLevel;
  axes: {
    structuredData: AxisResult;
    identityConsistency: AxisResult;
    authoritySignals: AxisResult;
    technicalAccessibility: AxisResult;
  };
  actionPlan: ActionItem[];
}

export type AuditErrorCode =
  | "INVALID_URL"
  | "FORBIDDEN_URL"
  | "SITE_UNREACHABLE"
  | "TIMEOUT"
  | "INTERNAL_ERROR";

export interface AuditErrorResponse {
  error: string;
  code: AuditErrorCode;
  details?: string;
}

export interface McpTools {
  fetchPage: (input: { url: string }) => Promise<FetchPageOutput>;
  fetchRobotsTxt: (input: { baseUrl: string }) => Promise<FetchRobotsTxtOutput>;
  checkUrlAccessibility: (
    input: CheckUrlAccessibilityInput
  ) => Promise<CheckUrlAccessibilityOutput>;
}

export interface AnalysisContext {
  url: string;
  html: string;
  statusCode: number;
  responseTimeMs: number;
  headers: Record<string, string>;
  robotsTxt: string | null;
  tools: McpTools;
}

export interface Analyzer {
  analyze(context: AnalysisContext): Promise<AxisResult>;
}
