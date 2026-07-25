import type { AxisResult, AxisName, ActionItem, Finding, EffortLevel } from "@/types";

interface AxesWithNames {
  axisName: AxisName;
  result: AxisResult;
}

const AXIS_WEIGHT_ORDER: AxisName[] = [
  "structuredData",
  "technicalAccessibility",
  "identityConsistency",
  "authoritySignals",
];

const EFFORT_BY_FINDING_TITLE: Record<string, EffortLevel> = {
  "No se encontro schema markup en el sitio": "medio",
  "robots.txt bloquea todo el sitio para crawlers genericos": "bajo",
  "El sitio no responde con un codigo HTTP exitoso": "alto",
  "El sitio parece depender exclusivamente de JavaScript del lado del cliente": "alto",
};

const DEFAULT_EFFORT_BY_FINDING_TYPE: Record<string, EffortLevel> = {
  critical: "medio",
  warning: "bajo",
};

const GENERIC_RECOMMENDATIONS: ActionItem[] = [
  {
    priority: 90,
    title: "Agregar schema markup de tipo Person u Organization",
    reason:
      "Los datos estructurados permiten que buscadores e IA identifiquen con precision quien es el autor o que representa el sitio.",
    effort: "medio",
    axis: "structuredData",
  },
  {
    priority: 91,
    title: "Incluir open graph tags en todas las paginas principales",
    reason:
      "Los og tags controlan como se muestra el sitio al compartirlo en redes sociales y en resultados enriquecidos.",
    effort: "bajo",
    axis: "technicalAccessibility",
  },
  {
    priority: 92,
    title: "Agregar enlaces a perfiles profesionales en plataformas reconocidas",
    reason:
      "Los enlaces a GitHub, LinkedIn y otras plataformas refuerzan la identidad cruzada y las senales de autoridad.",
    effort: "bajo",
    axis: "authoritySignals",
  },
];

const MINIMUM_RECOMMENDATIONS = 3;

function getEffortForFinding(finding: Finding): EffortLevel {
  return (
    EFFORT_BY_FINDING_TITLE[finding.title] ??
    DEFAULT_EFFORT_BY_FINDING_TYPE[finding.type] ??
    "medio"
  );
}

function getAxisWeightPriority(axisName: AxisName): number {
  const index = AXIS_WEIGHT_ORDER.indexOf(axisName);
  return index >= 0 ? index : AXIS_WEIGHT_ORDER.length;
}

function buildActionItemFromFinding(
  finding: Finding,
  axisName: AxisName,
  priority: number
): ActionItem {
  return {
    priority,
    title: finding.title,
    reason: finding.description,
    effort: getEffortForFinding(finding),
    axis: axisName,
  };
}

function extractActionableFindings(axesWithNames: AxesWithNames[]): ActionItem[] {
  const items: ActionItem[] = [];
  let priorityCounter = 1;

  const sortedAxes = [...axesWithNames].sort(
    (a, b) => getAxisWeightPriority(a.axisName) - getAxisWeightPriority(b.axisName)
  );

  const criticalFindings: { finding: Finding; axisName: AxisName }[] = [];
  const warningFindings: { finding: Finding; axisName: AxisName }[] = [];

  for (const { axisName, result } of sortedAxes) {
    for (const finding of result.findings) {
      if (finding.type === "critical") {
        criticalFindings.push({ finding, axisName });
      } else if (finding.type === "warning") {
        warningFindings.push({ finding, axisName });
      }
    }
  }

  for (const { finding, axisName } of criticalFindings) {
    items.push(buildActionItemFromFinding(finding, axisName, priorityCounter));
    priorityCounter++;
  }

  for (const { finding, axisName } of warningFindings) {
    items.push(buildActionItemFromFinding(finding, axisName, priorityCounter));
    priorityCounter++;
  }

  return items;
}

function fillWithGenericRecommendations(items: ActionItem[]): ActionItem[] {
  if (items.length >= MINIMUM_RECOMMENDATIONS) return items;

  const existingTitles = new Set(items.map((item) => item.title));
  const filledItems = [...items];

  for (const generic of GENERIC_RECOMMENDATIONS) {
    if (filledItems.length >= MINIMUM_RECOMMENDATIONS) break;
    if (existingTitles.has(generic.title)) continue;
    filledItems.push({ ...generic, priority: filledItems.length + 1 });
  }

  return filledItems;
}

export function generateActionPlan(axes: {
  structuredData: AxisResult;
  identityConsistency: AxisResult;
  authoritySignals: AxisResult;
  technicalAccessibility: AxisResult;
}): ActionItem[] {
  const axesWithNames: AxesWithNames[] = [
    { axisName: "structuredData", result: axes.structuredData },
    { axisName: "identityConsistency", result: axes.identityConsistency },
    { axisName: "authoritySignals", result: axes.authoritySignals },
    { axisName: "technicalAccessibility", result: axes.technicalAccessibility },
  ];

  const actionItems = extractActionableFindings(axesWithNames);
  return fillWithGenericRecommendations(actionItems);
}
