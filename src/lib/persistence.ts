import { getPublicSupabase, isSupabaseConfigured } from "@/lib/supabase";
import { getServerSupabase, isServerSupabaseConfigured } from "@/lib/supabase-server";
import { generateUniqueCode } from "@/lib/code-generator";
import type { AuditResponse } from "@/types";

export interface SiteMetadata {
  siteName: string;
  faviconUrl: string | null;
}

export interface SavedAnalysis {
  code: string;
  url: string;
  siteName: string;
  faviconUrl: string | null;
  report: AuditResponse;
  createdAt: string;
}

export interface SavedComparison {
  code: string;
  reportA: AuditResponse;
  reportB: AuditResponse;
  siteNameA: string;
  siteNameB: string;
  faviconUrlA: string | null;
  faviconUrlB: string | null;
  createdAt: string;
}

const MAX_CODE_GENERATION_ATTEMPTS = 5;

async function generateNonCollidingCode(): Promise<string> {
  const supabase = getServerSupabase() ?? getPublicSupabase();
  for (let attempt = 0; attempt < MAX_CODE_GENERATION_ATTEMPTS; attempt++) {
    const code = generateUniqueCode();

    if (!supabase) return code;

    const { data: existingAnalysis } = await supabase
      .from("analyses")
      .select("id")
      .eq("code", code)
      .limit(1);

    const { data: existingComparison } = await supabase
      .from("comparisons")
      .select("id")
      .eq("code", code)
      .limit(1);

    const analysisCollision = existingAnalysis && existingAnalysis.length > 0;
    const comparisonCollision = existingComparison && existingComparison.length > 0;

    if (!analysisCollision && !comparisonCollision) {
      return code;
    }
  }

  return `${generateUniqueCode()}-${Date.now().toString(36).slice(-4)}`;
}

export async function saveAnalysis(
  report: AuditResponse,
  metadata: SiteMetadata
): Promise<string | null> {
  if (!isServerSupabaseConfigured()) return null;

  try {
    const code = await generateNonCollidingCode();
    const supabase = getServerSupabase()!;

    const insertData = {
      code,
      url: report.url,
      site_name: metadata.siteName,
      favicon_url: metadata.faviconUrl,
      report: report as unknown as Record<string, unknown>,
    };

    const { error } = await supabase.from("analyses").insert(insertData);

    if (error) {
      console.error("[Entiscore] Error al guardar análisis en Supabase:", error.message);
      return null;
    }

    return code;
  } catch (error) {
    console.error("[Entiscore] Error inesperado al guardar análisis:", error);
    return null;
  }
}

export async function saveComparison(
  reportA: AuditResponse,
  reportB: AuditResponse,
  metadataA: SiteMetadata,
  metadataB: SiteMetadata
): Promise<string | null> {
  if (!isServerSupabaseConfigured()) return null;

  try {
    const code = await generateNonCollidingCode();
    const supabase = getServerSupabase()!;

    const insertData = {
      code,
      report_a: reportA as unknown as Record<string, unknown>,
      report_b: reportB as unknown as Record<string, unknown>,
      site_name_a: metadataA.siteName,
      site_name_b: metadataB.siteName,
      favicon_url_a: metadataA.faviconUrl,
      favicon_url_b: metadataB.faviconUrl,
    };

    const { error } = await supabase.from("comparisons").insert(insertData);

    if (error) {
      console.error("[Entiscore] Error al guardar comparación en Supabase:", error.message);
      return null;
    }

    return code;
  } catch (error) {
    console.error("[Entiscore] Error inesperado al guardar comparación:", error);
    return null;
  }
}

export async function getAnalysisByCode(code: string): Promise<SavedAnalysis | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = getPublicSupabase()!;

  const { data, error } = await supabase
    .from("analyses")
    .select("*")
    .eq("code", code)
    .limit(1)
    .single();

  if (error || !data) return null;

  return {
    code: data.code,
    url: data.url,
    siteName: data.site_name,
    faviconUrl: data.favicon_url,
    report: data.report as unknown as AuditResponse,
    createdAt: data.created_at,
  };
}

export async function getComparisonByCode(code: string): Promise<SavedComparison | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = getPublicSupabase()!;

  const { data, error } = await supabase
    .from("comparisons")
    .select("*")
    .eq("code", code)
    .limit(1)
    .single();

  if (error || !data) return null;

  return {
    code: data.code,
    reportA: data.report_a as unknown as AuditResponse,
    reportB: data.report_b as unknown as AuditResponse,
    siteNameA: data.site_name_a,
    siteNameB: data.site_name_b,
    faviconUrlA: data.favicon_url_a,
    faviconUrlB: data.favicon_url_b,
    createdAt: data.created_at,
  };
}
