import { notFound } from "next/navigation";
import { getAnalysisByCode, getComparisonByCode } from "@/lib/persistence";
import { SharedReportView } from "./SharedReportView";
import { SharedComparisonView } from "./SharedComparisonView";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ codigo: string }>;
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
