import { jsPDF } from "jspdf";
import type { AuditResponse, FindingType, MaturityLevel, EffortLevel } from "@/types";

const PAGE_MARGIN_X = 20;
const PAGE_MARGIN_TOP = 20;
const PAGE_BOTTOM_LIMIT = 270;
const LINE_HEIGHT = 6;
const SECTION_GAP = 12;

const BRAND_INDIGO: [number, number, number] = [79, 70, 229];
const COLOR_WHITE: [number, number, number] = [255, 255, 255];
const COLOR_BLACK: [number, number, number] = [39, 39, 42];
const COLOR_GRAY: [number, number, number] = [113, 113, 122];
const COLOR_LIGHT_GRAY: [number, number, number] = [228, 228, 231];

const MATURITY_COLORS: Record<MaturityLevel, [number, number, number]> = {
  bajo: [225, 29, 72],
  medio: [217, 119, 6],
  alto: [16, 185, 129],
  excelente: [34, 197, 94],
};

const FINDING_COLORS: Record<FindingType, [number, number, number]> = {
  positive: [16, 185, 129],
  warning: [217, 119, 6],
  critical: [225, 29, 72],
};

const FINDING_LABELS: Record<FindingType, string> = {
  positive: "[+]",
  warning: "[!]",
  critical: "[X]",
};

const EFFORT_COLORS: Record<EffortLevel, [number, number, number]> = {
  bajo: [16, 185, 129],
  medio: [217, 119, 6],
  alto: [225, 29, 72],
};

const AXIS_LABELS: Record<string, string> = {
  structuredData: "Datos estructurados",
  identityConsistency: "Consistencia de identidad",
  authoritySignals: "Senales de autoridad",
  technicalAccessibility: "Accesibilidad tecnica",
};

function ensureSpace(doc: jsPDF, currentY: number, neededSpace: number): number {
  if (currentY + neededSpace > PAGE_BOTTOM_LIMIT) {
    doc.addPage();
    return PAGE_MARGIN_TOP;
  }
  return currentY;
}

function addWrappedText(
  doc: jsPDF,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  color: [number, number, number] = COLOR_BLACK
): number {
  doc.setTextColor(...color);
  const lines: string[] = doc.splitTextToSize(text, maxWidth);
  for (const line of lines) {
    y = ensureSpace(doc, y, LINE_HEIGHT);
    doc.text(line, x, y);
    y += LINE_HEIGHT;
  }
  return y;
}

function drawHorizontalRule(doc: jsPDF, y: number): number {
  const pageWidth = doc.internal.pageSize.getWidth();
  doc.setDrawColor(...COLOR_LIGHT_GRAY);
  doc.setLineWidth(0.3);
  doc.line(PAGE_MARGIN_X, y, pageWidth - PAGE_MARGIN_X, y);
  return y + 4;
}

function addFooter(doc: jsPDF, code: string | undefined) {
  const pageCount = doc.getNumberOfPages();
  const pageWidth = doc.internal.pageSize.getWidth();
  const currentYear = new Date().getFullYear();
  const copyrightText = `Entiscore ${currentYear}. Carlos Jose Castro Galante y Matias Edgardo Tula Sarquis.`;
  const linkText = code ? `https://entiscore.vercel.app/r/${code}` : "https://entiscore.vercel.app";

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);

    doc.setDrawColor(...COLOR_LIGHT_GRAY);
    doc.setLineWidth(0.3);
    doc.line(PAGE_MARGIN_X, 282, pageWidth - PAGE_MARGIN_X, 282);

    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...COLOR_GRAY);
    doc.text(copyrightText, PAGE_MARGIN_X, 287);
    doc.text(linkText, pageWidth - PAGE_MARGIN_X, 287, { align: "right" });

    doc.text(`${i} / ${pageCount}`, pageWidth / 2, 287, { align: "center" });
  }
}

function renderHeader(
  doc: jsPDF,
  report: AuditResponse,
  code: string | undefined,
  logoDataUrl: string | null
): number {
  const pageWidth = doc.internal.pageSize.getWidth();
  let currentY = PAGE_MARGIN_TOP;

  if (logoDataUrl) {
    doc.addImage(logoDataUrl, "PNG", PAGE_MARGIN_X, currentY - 4, 14, 14);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...BRAND_INDIGO);
    doc.text("Entiscore", PAGE_MARGIN_X + 18, currentY + 6);
  } else {
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...BRAND_INDIGO);
    doc.text("Entiscore", PAGE_MARGIN_X, currentY + 6);
  }

  currentY += 18;

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...COLOR_GRAY);
  doc.text(`URL: ${report.url}`, PAGE_MARGIN_X, currentY);
  currentY += LINE_HEIGHT;

  const formattedDate = new Date(report.timestamp).toLocaleDateString("es-AR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  doc.text(`Fecha: ${formattedDate}`, PAGE_MARGIN_X, currentY);
  currentY += LINE_HEIGHT;

  if (code) {
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...BRAND_INDIGO);
    doc.text(`Codigo: ${code}`, PAGE_MARGIN_X, currentY);
    doc.setFont("helvetica", "normal");
    currentY += LINE_HEIGHT;
  }

  currentY += 4;
  currentY = drawHorizontalRule(doc, currentY);
  currentY += 4;

  const maturityColor = MATURITY_COLORS[report.maturityLevel];
  doc.setFontSize(28);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...maturityColor);
  doc.text(`${report.overallScore}`, pageWidth / 2, currentY + 10, { align: "center" });
  currentY += 14;

  doc.setFontSize(9);
  doc.setTextColor(...COLOR_GRAY);
  doc.text("de 100", pageWidth / 2, currentY, { align: "center" });
  currentY += LINE_HEIGHT;

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...maturityColor);
  const maturityLabel = report.maturityLevel.charAt(0).toUpperCase() + report.maturityLevel.slice(1);
  doc.text(maturityLabel, pageWidth / 2, currentY, { align: "center" });
  currentY += SECTION_GAP;

  currentY = drawHorizontalRule(doc, currentY);

  if (report.executiveSummary) {
    currentY += 4;
    doc.setFontSize(9);
    doc.setFont("helvetica", "italic");
    currentY = addWrappedText(
      doc,
      report.executiveSummary,
      PAGE_MARGIN_X,
      currentY,
      pageWidth - PAGE_MARGIN_X * 2,
      COLOR_GRAY
    );
    currentY += 4;
    currentY = drawHorizontalRule(doc, currentY);
  }

  return currentY;
}

function renderAxes(doc: jsPDF, report: AuditResponse, startY: number): number {
  const pageWidth = doc.internal.pageSize.getWidth();
  const contentWidth = pageWidth - PAGE_MARGIN_X * 2;
  let currentY = startY + 4;

  for (const [axisKey, axisResult] of Object.entries(report.axes)) {
    const label = AXIS_LABELS[axisKey] ?? axisKey;

    currentY = ensureSpace(doc, currentY, 20);

    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...BRAND_INDIGO);
    doc.text(label, PAGE_MARGIN_X, currentY);

    const scoreColor =
      axisResult.score >= 70 ? MATURITY_COLORS.alto :
      axisResult.score >= 40 ? MATURITY_COLORS.medio :
      MATURITY_COLORS.bajo;
    doc.setTextColor(...scoreColor);
    doc.text(`${axisResult.score}/100`, pageWidth - PAGE_MARGIN_X, currentY, { align: "right" });

    currentY += LINE_HEIGHT + 3;

    doc.setFontSize(8.5);
    doc.setFont("helvetica", "normal");

    for (const finding of axisResult.findings) {
      currentY = ensureSpace(doc, currentY, 14);

      const findingColor = FINDING_COLORS[finding.type];
      const findingLabel = FINDING_LABELS[finding.type];

      doc.setFont("helvetica", "bold");
      doc.setTextColor(...findingColor);
      doc.text(findingLabel, PAGE_MARGIN_X + 4, currentY);

      doc.setFont("helvetica", "bold");
      doc.setTextColor(...COLOR_BLACK);
      doc.text(finding.title, PAGE_MARGIN_X + 14, currentY);
      currentY += LINE_HEIGHT;

      doc.setFont("helvetica", "normal");
      currentY = addWrappedText(
        doc,
        finding.description,
        PAGE_MARGIN_X + 14,
        currentY,
        contentWidth - 18,
        COLOR_GRAY
      );
      currentY += 3;
    }

    currentY += 4;
    currentY = drawHorizontalRule(doc, currentY);
    currentY += 2;
  }

  return currentY;
}

function renderActionPlan(doc: jsPDF, report: AuditResponse, startY: number): number {
  const pageWidth = doc.internal.pageSize.getWidth();
  const contentWidth = pageWidth - PAGE_MARGIN_X * 2;
  let currentY = ensureSpace(doc, startY, 20);

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...BRAND_INDIGO);
  doc.text("Plan de accion", PAGE_MARGIN_X, currentY);
  currentY += LINE_HEIGHT + 4;

  doc.setFontSize(8.5);

  for (const item of report.actionPlan) {
    currentY = ensureSpace(doc, currentY, 16);

    doc.setFont("helvetica", "bold");
    doc.setTextColor(...COLOR_BLACK);
    doc.text(`${item.priority}.`, PAGE_MARGIN_X + 4, currentY);
    doc.text(item.title, PAGE_MARGIN_X + 14, currentY);

    const effortColor = EFFORT_COLORS[item.effort];
    const effortLabel = `[${item.effort}]`;
    const titleWidth = doc.getTextWidth(item.title);
    const effortX = PAGE_MARGIN_X + 14 + titleWidth + 4;

    if (effortX + doc.getTextWidth(effortLabel) < pageWidth - PAGE_MARGIN_X) {
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...effortColor);
      doc.text(effortLabel, effortX, currentY);
    }

    currentY += LINE_HEIGHT;

    doc.setFont("helvetica", "normal");
    currentY = addWrappedText(
      doc,
      item.reason,
      PAGE_MARGIN_X + 14,
      currentY,
      contentWidth - 18,
      COLOR_GRAY
    );
    currentY += 4;
  }

  return currentY;
}

async function loadLogoAsDataUrl(): Promise<string | null> {
  try {
    const response = await fetch("/logo/entiscore.png");
    if (!response.ok) return null;
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

export async function generateAuditPdf(report: AuditResponse): Promise<void> {
  const reportWithExtras = report as AuditResponse & { code?: string };
  const code = reportWithExtras.code;
  const logoDataUrl = await loadLogoAsDataUrl();

  const doc = new jsPDF();

  let currentY = renderHeader(doc, report, code, logoDataUrl);
  currentY = renderAxes(doc, report, currentY);
  currentY = renderActionPlan(doc, report, currentY);

  addFooter(doc, code);

  const hostname = new URL(report.url).hostname;
  const dateSlug = new Date(report.timestamp).toISOString().slice(0, 10);
  const filename = `entiscore-${hostname}-${dateSlug}.pdf`;
  doc.save(filename);
}
