import * as cheerio from "cheerio";
import type { Analyzer, AnalysisContext, AxisResult, Finding } from "@/types";
import {
  AUTHORITY_PLATFORM_DOMAINS,
  extractSameAsLinksFromSchema,
  filterLinksByDomainList,
  deduplicateByDomain,
} from "@/agent/shared-platforms";
import { getFinding } from "@/i18n/findings";

const ACHIEVEMENT_KEYWORDS = [
  "certificación",
  "certificacion",
  "certified",
  "certification",
  "speaker",
  "conferencia",
  "conference",
  "contributor",
  "contribuidor",
  "open source",
  "open-source",
  "publicado",
  "published",
  "publication",
  "publicación",
  "award",
  "premio",
  "patent",
  "patente",
  "mentor",
  "instructor",
  "author",
  "co-author",
  "coautor",
];

const SCORE_WEIGHT_PLATFORM_LINKS = 30;
const SCORE_WEIGHT_AUTHOR_METADATA = 25;
const SCORE_WEIGHT_DATE_METADATA = 20;
const SCORE_WEIGHT_ACHIEVEMENT_MENTIONS = 25;

function extractAuthorityPlatformLinks(html: string): string[] {
  const $ = cheerio.load(html);
  const anchorLinks: string[] = [];

  $("a[href]").each((_, element) => {
    const href = $(element).attr("href");
    if (!href) return;

    try {
      const url = new URL(href);
      const hostname = url.hostname.replace(/^www\./, "");
      const isAuthorityPlatform = AUTHORITY_PLATFORM_DOMAINS.some(
        (domain) => hostname === domain || hostname.endsWith(`.${domain}`)
      );
      if (isAuthorityPlatform && !anchorLinks.includes(href)) {
        anchorLinks.push(href);
      }
    } catch {
      return;
    }
  });

  const sameAsLinks = extractSameAsLinksFromSchema(html);
  const filteredSameAs = filterLinksByDomainList(sameAsLinks, AUTHORITY_PLATFORM_DOMAINS);

  const combinedLinks = [...anchorLinks, ...filteredSameAs];
  return deduplicateByDomain(combinedLinks);
}

function evaluateAuthorityLinks(links: string[], locale: "es" | "en"): Finding[] {
  if (links.length === 0) {
    const tpl = getFinding(locale, "as.no_links");
    return [{ type: "warning", title: tpl.title, description: tpl.description }];
  }

  const uniqueDomains = extractUniqueDomains(links);
  const plural = uniqueDomains.length > 1 ? "s" : "";
  const tpl = getFinding(locale, "as.platforms_found", { count: uniqueDomains.length, plural, domains: uniqueDomains.join(", ") });

  return [{ type: "positive", title: tpl.title, description: tpl.description, details: links.join("\n") }];
}

function extractUniqueDomains(links: string[]): string[] {
  const domains = new Set<string>();
  for (const link of links) {
    try {
      const hostname = new URL(link).hostname.replace(/^www\./, "");
      domains.add(hostname);
    } catch {
      continue;
    }
  }
  return Array.from(domains);
}

interface AuthorMetadata {
  metaAuthor: string | null;
  linkRelAuthor: string | null;
  schemaAuthor: string | null;
}

function extractAuthorMetadata(html: string): AuthorMetadata {
  const $ = cheerio.load(html);

  const metaAuthor = $('meta[name="author"]').attr("content")?.trim() ?? null;
  const linkRelAuthor = $('link[rel="author"]').attr("href")?.trim() ?? null;

  let schemaAuthor: string | null = null;
  $('script[type="application/ld+json"]').each((_, element) => {
    if (schemaAuthor) return;
    const rawContent = $(element).html();
    if (!rawContent) return;

    try {
      const parsed: unknown = JSON.parse(rawContent);
      const items = Array.isArray(parsed) ? parsed : [parsed];
      for (const item of items) {
        if (typeof item === "object" && item !== null && "author" in item) {
          const typedItem = item as Record<string, unknown>;
          const authorField = typedItem["author"];
          if (typeof authorField === "string") {
            schemaAuthor = authorField;
          } else if (typeof authorField === "object" && authorField !== null && "name" in authorField) {
            schemaAuthor = String((authorField as Record<string, unknown>)["name"]);
          }
        }
      }
    } catch {
      return;
    }
  });

  return { metaAuthor: metaAuthor || null, linkRelAuthor: linkRelAuthor || null, schemaAuthor };
}

function evaluateAuthorMetadata(metadata: AuthorMetadata, locale: "es" | "en"): Finding[] {
  const presentSources: string[] = [];
  if (metadata.metaAuthor) presentSources.push(`meta author ("${metadata.metaAuthor}")`);
  if (metadata.linkRelAuthor) presentSources.push("link rel=author");
  if (metadata.schemaAuthor) presentSources.push(`schema author ("${metadata.schemaAuthor}")`);

  if (presentSources.length === 0) {
    const tpl = getFinding(locale, "as.author_missing");
    return [{ type: "warning", title: tpl.title, description: tpl.description }];
  }

  const tpl = getFinding(locale, "as.author_present", { sources: presentSources.join(", ") });
  return [{ type: "positive", title: tpl.title, description: tpl.description }];
}

interface DateMetadata {
  publishedTime: string | null;
  modifiedTime: string | null;
  schemaDatePublished: string | null;
  schemaDateModified: string | null;
}

function extractDateMetadata(html: string): DateMetadata {
  const $ = cheerio.load(html);

  const publishedTime = $('meta[property="article:published_time"]').attr("content")?.trim() ?? null;
  const modifiedTime = $('meta[property="article:modified_time"]').attr("content")?.trim() ?? null;

  let schemaDatePublished: string | null = null;
  let schemaDateModified: string | null = null;

  $('script[type="application/ld+json"]').each((_, element) => {
    const rawContent = $(element).html();
    if (!rawContent) return;

    try {
      const parsed: unknown = JSON.parse(rawContent);
      const items = Array.isArray(parsed) ? parsed : [parsed];
      for (const item of items) {
        if (typeof item === "object" && item !== null) {
          const typedItem = item as Record<string, unknown>;
          if (typeof typedItem["datePublished"] === "string") {
            schemaDatePublished = typedItem["datePublished"] as string;
          }
          if (typeof typedItem["dateModified"] === "string") {
            schemaDateModified = typedItem["dateModified"] as string;
          }
        }
      }
    } catch {
      return;
    }
  });

  return { publishedTime: publishedTime || null, modifiedTime: modifiedTime || null, schemaDatePublished, schemaDateModified };
}

function evaluateDateMetadata(metadata: DateMetadata, locale: "es" | "en"): Finding[] {
  const hasDates = metadata.publishedTime || metadata.modifiedTime || metadata.schemaDatePublished || metadata.schemaDateModified;

  if (!hasDates) {
    const tpl = getFinding(locale, "as.dates_missing");
    return [{ type: "warning", title: tpl.title, description: tpl.description }];
  }

  const dateSources: string[] = [];
  if (metadata.publishedTime) dateSources.push("article:published_time");
  if (metadata.modifiedTime) dateSources.push("article:modified_time");
  if (metadata.schemaDatePublished) dateSources.push("schema datePublished");
  if (metadata.schemaDateModified) dateSources.push("schema dateModified");

  const tpl = getFinding(locale, "as.dates_present", { sources: dateSources.join(", ") });
  return [{ type: "positive", title: tpl.title, description: tpl.description }];
}

function detectAchievementMentions(html: string): string[] {
  const $ = cheerio.load(html);
  const bodyText = $("body").text().toLowerCase();
  const detectedKeywords: string[] = [];

  for (const keyword of ACHIEVEMENT_KEYWORDS) {
    if (bodyText.includes(keyword.toLowerCase())) {
      detectedKeywords.push(keyword);
    }
  }

  return detectedKeywords;
}

function evaluateAchievementMentions(detectedKeywords: string[], locale: "es" | "en"): Finding[] {
  if (detectedKeywords.length === 0) {
    const tpl = getFinding(locale, "as.achievements_missing");
    return [{ type: "warning", title: tpl.title, description: tpl.description }];
  }

  const tpl = getFinding(locale, "as.achievements_found", { keywords: detectedKeywords.join(", ") });
  return [{ type: "positive", title: tpl.title, description: tpl.description }];
}

function calculateAuthorityScore(
  authorityLinks: string[],
  authorMetadata: AuthorMetadata,
  dateMetadata: DateMetadata,
  achievementKeywords: string[]
): number {
  let score = 0;

  const uniqueDomains = extractUniqueDomains(authorityLinks);
  const platformRatio = Math.min(uniqueDomains.length / 3, 1);
  score += Math.round(SCORE_WEIGHT_PLATFORM_LINKS * platformRatio);

  const hasAuthor = authorMetadata.metaAuthor || authorMetadata.linkRelAuthor || authorMetadata.schemaAuthor;
  if (hasAuthor) score += SCORE_WEIGHT_AUTHOR_METADATA;

  const hasDates = dateMetadata.publishedTime || dateMetadata.modifiedTime || dateMetadata.schemaDatePublished || dateMetadata.schemaDateModified;
  if (hasDates) score += SCORE_WEIGHT_DATE_METADATA;

  const achievementRatio = Math.min(achievementKeywords.length / 3, 1);
  score += Math.round(SCORE_WEIGHT_ACHIEVEMENT_MENTIONS * achievementRatio);

  return Math.max(0, Math.min(100, score));
}

export const authoritySignalsAnalyzer: Analyzer = {
  async analyze(context: AnalysisContext): Promise<AxisResult> {
    const locale = context.locale;
    const authorityLinks = extractAuthorityPlatformLinks(context.html);
    const linkFindings = evaluateAuthorityLinks(authorityLinks, locale);

    const authorMetadata = extractAuthorMetadata(context.html);
    const authorFindings = evaluateAuthorMetadata(authorMetadata, locale);

    const dateMetadata = extractDateMetadata(context.html);
    const dateFindings = evaluateDateMetadata(dateMetadata, locale);

    const achievementKeywords = detectAchievementMentions(context.html);
    const achievementFindings = evaluateAchievementMentions(achievementKeywords, locale);

    const allFindings: Finding[] = [
      ...linkFindings,
      ...authorFindings,
      ...dateFindings,
      ...achievementFindings,
    ];

    const score = calculateAuthorityScore(
      authorityLinks,
      authorMetadata,
      dateMetadata,
      achievementKeywords
    );

    return { score, status: "evaluated", findings: allFindings };
  },
};
