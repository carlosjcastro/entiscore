import * as cheerio from "cheerio";
import type { Analyzer, AnalysisContext, AxisResult, Finding } from "@/types";
import {
  RECOGNIZED_PLATFORM_DOMAINS,
  extractSameAsLinksFromSchema,
  filterLinksByDomainList,
  deduplicateByDomain,
} from "@/agent/shared-platforms";

const SCORE_BASE = 50;
const SCORE_BONUS_PER_VALID_LINK = 10;
const SCORE_PENALTY_NAME_INCONSISTENCY = 20;
const SCORE_PENALTY_PER_BROKEN_LINK = 10;
const SCORE_PENALTY_NO_EXTERNAL_LINKS = 20;

interface NameSources {
  schemaName: string | null;
  ogTitle: string | null;
  htmlTitle: string | null;
}

function extractSchemaName(html: string): string | null {
  const $ = cheerio.load(html);
  const jsonLdScripts = $('script[type="application/ld+json"]');
  let schemaName: string | null = null;

  jsonLdScripts.each((_, element) => {
    const rawContent = $(element).html();
    if (!rawContent || schemaName) return;

    try {
      const parsed: unknown = JSON.parse(rawContent);
      const items = Array.isArray(parsed) ? parsed : [parsed];

      for (const item of items) {
        if (typeof item === "object" && item !== null && "name" in item) {
          const typedItem = item as Record<string, unknown>;
          if (typeof typedItem["name"] === "string" && typedItem["name"].trim().length > 0) {
            schemaName = typedItem["name"] as string;
            return;
          }
        }
      }
    } catch {
      return;
    }
  });

  return schemaName;
}

function extractOgTitle(html: string): string | null {
  const $ = cheerio.load(html);
  const ogTitleContent = $('meta[property="og:title"]').attr("content");
  if (ogTitleContent && ogTitleContent.trim().length > 0) {
    return ogTitleContent.trim();
  }
  return null;
}

function extractHtmlTitle(html: string): string | null {
  const $ = cheerio.load(html);
  const titleText = $("title").text().trim();
  return titleText.length > 0 ? titleText : null;
}

function extractNameSources(html: string): NameSources {
  return {
    schemaName: extractSchemaName(html),
    ogTitle: extractOgTitle(html),
    htmlTitle: extractHtmlTitle(html),
  };
}

function normalizeForComparison(value: string): string {
  return value.toLowerCase().trim().replace(/\s+/g, " ");
}

function namesAreSignificantlyDifferent(nameA: string, nameB: string): boolean {
  const normalizedA = normalizeForComparison(nameA);
  const normalizedB = normalizeForComparison(nameB);

  if (normalizedA === normalizedB) return false;

  if (normalizedA.includes(normalizedB) || normalizedB.includes(normalizedA)) {
    return false;
  }

  return true;
}

function evaluateNameConsistency(sources: NameSources): Finding[] {
  const findings: Finding[] = [];
  const availableSources: { label: string; value: string }[] = [];

  if (sources.schemaName) availableSources.push({ label: "Schema markup", value: sources.schemaName });
  if (sources.ogTitle) availableSources.push({ label: "og:title", value: sources.ogTitle });
  if (sources.htmlTitle) availableSources.push({ label: "title", value: sources.htmlTitle });

  if (availableSources.length < 2) {
    return findings;
  }

  let hasInconsistency = false;

  for (let i = 0; i < availableSources.length; i++) {
    for (let j = i + 1; j < availableSources.length; j++) {
      const sourceA = availableSources[i]!;
      const sourceB = availableSources[j]!;

      if (namesAreSignificantlyDifferent(sourceA.value, sourceB.value)) {
        hasInconsistency = true;
        findings.push({
          type: "warning",
          title: `Inconsistencia entre ${sourceA.label} y ${sourceB.label}`,
          description: `${sourceA.label} dice "${sourceA.value}" pero ${sourceB.label} dice "${sourceB.value}". Los buscadores e IA pueden interpretar esto como dos entidades distintas.`,
        });
      }
    }
  }

  if (!hasInconsistency && availableSources.length >= 2) {
    findings.push({
      type: "positive",
      title: "Nombre consistente entre fuentes",
      description: `El nombre es coherente entre las ${availableSources.length} fuentes evaluadas (${availableSources.map((s) => s.label).join(", ")}).`,
    });
  }

  return findings;
}

function extractExternalPlatformLinks(html: string): string[] {
  const $ = cheerio.load(html);
  const anchorLinks: string[] = [];

  $("a[href]").each((_, element) => {
    const href = $(element).attr("href");
    if (!href) return;

    try {
      const url = new URL(href);
      const hostname = url.hostname.replace(/^www\./, "");
      const isPlatformLink = RECOGNIZED_PLATFORM_DOMAINS.some(
        (domain) => hostname === domain || hostname.endsWith(`.${domain}`)
      );
      if (isPlatformLink && !anchorLinks.includes(href)) {
        anchorLinks.push(href);
      }
    } catch {
      return;
    }
  });

  const sameAsLinks = extractSameAsLinksFromSchema(html);
  const filteredSameAs = filterLinksByDomainList(sameAsLinks, RECOGNIZED_PLATFORM_DOMAINS);

  const combinedLinks = [...anchorLinks, ...filteredSameAs];
  return deduplicateByDomain(combinedLinks);
}

async function evaluateExternalLinks(
  links: string[],
  context: AnalysisContext
): Promise<Finding[]> {
  const findings: Finding[] = [];

  if (links.length === 0) {
    findings.push({
      type: "warning",
      title: "Sin enlaces a perfiles externos",
      description: "No se encontraron enlaces a plataformas profesionales o sociales reconocidas. Agregar enlaces a GitHub, LinkedIn u otras plataformas fortalece la identidad cruzada y mejora el reconocimiento como entidad.",
    });
    return findings;
  }

  const accessibilityResults = await Promise.all(
    links.map((url) => context.tools.checkUrlAccessibility({ url }))
  );

  for (let i = 0; i < links.length; i++) {
    const link = links[i]!;
    const result = accessibilityResults[i]!;
    const domain = new URL(link).hostname.replace(/^www\./, "");

    if (result.accessible) {
      findings.push({
        type: "positive",
        title: `Perfil en ${domain} accesible`,
        description: `El enlace a ${domain} responde correctamente (${result.statusCode}).`,
      });
    } else {
      findings.push({
        type: "warning",
        title: `Perfil en ${domain} no accesible`,
        description: `El enlace a ${domain} no responde o devuelve un error (código ${result.statusCode}). Esto puede indicar un enlace roto o un perfil inexistente.`,
      });
    }
  }

  return findings;
}

function calculateIdentityScore(
  nameFindings: Finding[],
  linkFindings: Finding[],
  totalLinks: number
): number {
  let score = SCORE_BASE;

  const hasNameInconsistency = nameFindings.some((f) => f.type === "warning");
  if (hasNameInconsistency) {
    score -= SCORE_PENALTY_NAME_INCONSISTENCY;
  }

  if (totalLinks === 0) {
    score -= SCORE_PENALTY_NO_EXTERNAL_LINKS;
  } else {
    const validLinks = linkFindings.filter((f) => f.type === "positive").length;
    const brokenLinks = linkFindings.filter((f) => f.type === "warning").length;
    score += Math.min(validLinks * SCORE_BONUS_PER_VALID_LINK, 50);
    score -= brokenLinks * SCORE_PENALTY_PER_BROKEN_LINK;
  }

  return Math.max(0, Math.min(100, score));
}

export const identityConsistencyAnalyzer: Analyzer = {
  async analyze(context: AnalysisContext): Promise<AxisResult> {
    const nameSources = extractNameSources(context.html);
    const nameFindings = evaluateNameConsistency(nameSources);

    const externalLinks = extractExternalPlatformLinks(context.html);
    const linkFindings = await evaluateExternalLinks(externalLinks, context);

    const allFindings = [...nameFindings, ...linkFindings];
    const score = calculateIdentityScore(nameFindings, linkFindings, externalLinks.length);

    return { score, status: "evaluated", findings: allFindings };
  },
};
