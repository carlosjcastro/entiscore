import type { AxisResult, MaturityLevel } from "@/types";

interface AxesResults {
  structuredData: AxisResult;
  identityConsistency: AxisResult;
  authoritySignals: AxisResult;
  technicalAccessibility: AxisResult;
}

interface ScoringResult {
  overallScore: number;
  maturityLevel: MaturityLevel;
}

const AXIS_WEIGHTS: Record<keyof AxesResults, number> = {
  structuredData: 0.3,
  identityConsistency: 0.2,
  authoritySignals: 0.2,
  technicalAccessibility: 0.3,
};

function isAxisEvaluated(axisResult: AxisResult): boolean {
  return axisResult.status === "evaluated";
}

function calculateWeightedScore(axes: AxesResults): number {
  const evaluatedEntries = Object.entries(axes).filter(([, result]) =>
    isAxisEvaluated(result)
  ) as [keyof AxesResults, AxisResult][];

  if (evaluatedEntries.length === 0) return 0;

  const totalEvaluatedWeight = evaluatedEntries.reduce(
    (sum, [axisName]) => sum + AXIS_WEIGHTS[axisName],
    0
  );

  const weightedSum = evaluatedEntries.reduce(
    (sum, [axisName, result]) =>
      sum + result.score * (AXIS_WEIGHTS[axisName] / totalEvaluatedWeight),
    0
  );

  return Math.round(weightedSum);
}

function mapScoreToMaturityLevel(score: number): MaturityLevel {
  if (score >= 80) return "excelente";
  if (score >= 60) return "alto";
  if (score >= 40) return "medio";
  return "bajo";
}

export function calculateOverallScore(axes: AxesResults): ScoringResult {
  const overallScore = calculateWeightedScore(axes);
  const maturityLevel = mapScoreToMaturityLevel(overallScore);
  return { overallScore, maturityLevel };
}
