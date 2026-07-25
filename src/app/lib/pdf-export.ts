import { jsPDF } from "jspdf";
import type { AuditResponse } from "@/types";

const PAGE_MARGIN = 20;
const LINE_HEIGHT = 7;
const SECTION_GAP = 10;

function addWrappedText(doc: jsPDF, text: string, x: number, y: number, maxWidth: number): number {
  const lines = doc.splitTextToSize(text, maxWidth);
  for (const line of lines) {
    if (y > 270) {
      doc.addPage();
      y = PAGE_MARGIN;
    }
    doc.text(line, x, y);
    y += LINE_HEIGHT;
  }
  return y;
}

export function generateAuditPdf(report: AuditResponse) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const contentWidth = pageWidth - PAGE_MARGIN * 2;
  let currentY = PAGE_MARGIN;

  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("Entiscore: Reporte de Entidad Digital", PAGE_MARGIN, currentY);
  currentY += LINE_HEIGHT * 2;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`URL: ${report.url}`, PAGE_MARGIN, currentY);
  currentY += LINE_HEIGHT;
  doc.text(`Fecha: ${new Date(report.timestamp).toLocaleDateString("es-AR")}`, PAGE_MARGIN, currentY);
  currentY += LINE_HEIGHT;
  doc.text(`Puntaje general: ${report.overallScore}/100 (${report.maturityLevel})`, PAGE_MARGIN, currentY);
  currentY += SECTION_GAP * 2;

  const axisLabels: Record<string, string> = {
    structuredData: "Datos estructurados",
    identityConsistency: "Consistencia de identidad",
    authoritySignals: "Señales de autoridad",
    technicalAccessibility: "Accesibilidad técnica",
  };

  for (const [axisKey, axisResult] of Object.entries(report.axes)) {
    const label = axisLabels[axisKey] ?? axisKey;

    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    if (currentY > 260) {
      doc.addPage();
      currentY = PAGE_MARGIN;
    }
    doc.text(`${label} (${axisResult.score}/100)`, PAGE_MARGIN, currentY);
    currentY += LINE_HEIGHT + 2;

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");

    for (const finding of axisResult.findings) {
      const prefix = finding.type === "positive" ? "[+]" : finding.type === "warning" ? "[!]" : "[X]";
      currentY = addWrappedText(doc, `${prefix} ${finding.title}`, PAGE_MARGIN + 4, currentY, contentWidth - 8);
      currentY = addWrappedText(doc, finding.description, PAGE_MARGIN + 8, currentY, contentWidth - 12);
      currentY += 3;
    }

    currentY += SECTION_GAP;
  }

  if (currentY > 240) {
    doc.addPage();
    currentY = PAGE_MARGIN;
  }

  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text("Plan de acción", PAGE_MARGIN, currentY);
  currentY += LINE_HEIGHT + 2;

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");

  for (const item of report.actionPlan) {
    currentY = addWrappedText(
      doc,
      `#${item.priority}. ${item.title} (esfuerzo: ${item.effort})`,
      PAGE_MARGIN + 4,
      currentY,
      contentWidth - 8
    );
    currentY = addWrappedText(doc, item.reason, PAGE_MARGIN + 8, currentY, contentWidth - 12);
    currentY += 4;
  }

  const filename = `entiscore-${new URL(report.url).hostname}-${new Date(report.timestamp).toISOString().slice(0, 10)}.pdf`;
  doc.save(filename);
}
