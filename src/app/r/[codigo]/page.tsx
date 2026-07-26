import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getAnalysisByCode, getComparisonByCode } from "@/lib/persistence";
import { SharedReportView } from "./SharedReportView";
import { SharedComparisonView } from "./SharedComparisonView";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ codigo: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { codigo } = await params;
  const baseUrl = "https://entiscore.vercel.app";

  const analysis = await getAnalysisByCode(codigo);
  if (analysis) {
    const title = `${analysis.siteName}: ${analysis.report.overallScore}/100`;
    const description = `Reporte de entidad digital de ${analysis.url}. Puntaje: ${analysis.report.overallScore}/100 (${analysis.report.maturityLevel}).`;
    return {
      title,
      description,
      openGraph: { title, description, url: `${baseUrl}/r/${codigo}` },
      twitter: { card: "summary", title, description },
      alternates: { canonical: `${baseUrl}/r/${codigo}` },
    };
  }

  const comparison = await getComparisonByCode(codigo);
  if (comparison) {
    const title = `${comparison.siteNameA} vs ${comparison.siteNameB}`;
    const description = `Comparativa de entidad digital entre ${comparison.siteNameA} (${comparison.reportA.overallScore}/100) y ${comparison.siteNameB} (${comparison.reportB.overallScore}/100).`;
    return {
      title,
      description,
      openGraph: { title, description, url: `${baseUrl}/r/${codigo}` },
      twitter: { card: "summary", title, description },
      alternates: { canonical: `${baseUrl}/r/${codigo}` },
    };
  }

  return { title: "Resultado no encontrado" };
}

export default async function SharedResultPage({ params }: PageProps) {
  const { codigo } = await params;

  const analysis = await getAnalysisByCode(codigo);
  if (analysis) {
    return (
      <SharedReportView
        report={analysis.report}
        siteName={analysis.siteName}
        faviconUrl={analysis.faviconUrl}
        code={analysis.code}
      />
    );
  }

  const comparison = await getComparisonByCode(codigo);
  if (comparison) {
    return (
      <SharedComparisonView
        reportA={comparison.reportA}
        reportB={comparison.reportB}
        siteNameA={comparison.siteNameA}
        siteNameB={comparison.siteNameB}
        code={comparison.code}
      />
    );
  }

  notFound();
}
