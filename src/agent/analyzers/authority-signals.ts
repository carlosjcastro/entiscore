import * as cheerio from "cheerio";
import type { Analyzer, AnalysisContext, AxisResult, Finding } from "@/types";
import { AUTHORITY_PLATFORM_DOMAINS } from "@/agent/shared-platforms";

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
  const authorityLinks: string[] = [];

  $("a[href]").each((_, element) => {
    const href = $(element).attr("href");
    if (!href) return;

    try {
      const url = new URL(href);
      const hostname = url.hostname.replace(/^www\./, "");
      const isAuthorityPlatform = AUTHORITY_PLATFORM_DOMAINS.some(
        (domain) => hostname === domain || hostname.endsWith(`.${domain}`)
      );
      if (isAuthorityPlatform && !authorityLinks.includes(href)) {
        authorityLinks.push(href);
      }
    } catch {
      return;
    }
  });

  return authorityLinks;
}

function evaluateAuthorityLinks(links: string[]): Finding[] {
  if (links.length === 0) {
    return [
      {
        type: "warning",
        title: "Sin enlaces a plataformas de autoridad",
        description:
          "No se encontraron enlaces a plataformas profesionales de publicación o contribución técnica. Incluir enlaces a GitHub, Medium, Dev.to u otras plataformas donde tengas actividad refuerza tu autoridad como profesional.",
      },
    ];
  }

  const uniqueDomains = extractUniqueDomains(links);

  return [
    {
      type: "positive",
      title: `${uniqueDomains.length} plataforma${uniqueDomains.length > 1 ? "s" : ""} de autoridad enlazada${uniqueDomains.length > 1 ? "s" : ""}`,
      description: `Se encontraron enlaces a: ${uniqueDomains.join(", ")}. Esto refuerza la presencia profesional y la credibilidad ante buscadores e IA.`,
    },
  ];
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

function evaluateAuthorMetadata(metadata: AuthorMetadata): Finding[] {
  const presentSources: string[] = [];
  if (metadata.metaAuthor) presentSources.push(`meta author ("${metadata.metaAuthor}")`);
  if (metadata.linkRelAuthor) presentSources.push("link rel=author");
  if (metadata.schemaAuthor) presentSources.push(`schema author ("${metadata.schemaAuthor}")`);

  if (presentSources.length === 0) {
    return [
      {
        type: "warning",
        title: "Sin metadata de autoría",
        description:
          "No se encontró meta author, link rel=author ni campo author en el schema markup. Definir la autoría permite a buscadores e IA atribuir el contenido a una persona específica.",
      },
    ];
  }

  return [
    {
      type: "positive",
      title: "Metadata de autoría presente",
      description: `Se encontró autoría definida en: ${presentSources.join(", ")}. Esto ayuda a atribuir el contenido a una entidad específica.`,
    },
  ];
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

function evaluateDateMetadata(metadata: DateMetadata): Finding[] {
  const hasDates = metadata.publishedTime || metadata.modifiedTime || metadata.schemaDatePublished || metadata.schemaDateModified;

  if (!hasDates) {
    return [
      {
        type: "warning",
        title: "Sin fechas de publicación o actualización",
        description:
          "No se encontraron fechas de publicación ni de modificación en metadata o schema. Las fechas indican a buscadores que el contenido está actualizado y vigente.",
      },
    ];
  }

  const dateSources: string[] = [];
  if (metadata.publishedTime) dateSources.push("article:published_time");
  if (metadata.modifiedTime) dateSources.push("article:modified_time");
  if (metadata.schemaDatePublished) dateSources.push("schema datePublished");
  if (metadata.schemaDateModified) dateSources.push("schema dateModified");

  return [
    {
      type: "positive",
      title: "Fechas de publicación presentes",
      description: `Se encontraron fechas en: ${dateSources.join(", ")}. Esto indica que el contenido tiene una línea temporal definida.`,
    },
  ];
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

function evaluateAchievementMentions(detectedKeywords: string[]): Finding[] {
  if (detectedKeywords.length === 0) {
    return [
      {
        type: "warning",
        title: "Sin menciones de logros o contribuciones",
        description:
          "No se detectaron menciones de certificaciones, conferencias, contribuciones open source u otros logros profesionales en el contenido visible. Incluir estos logros refuerza la percepción de autoridad.",
      },
    ];
  }

  return [
    {
      type: "positive",
      title: `Menciones de logros detectadas`,
      description: `Se encontraron referencias a: ${detectedKeywords.join(", ")}. Estas menciones refuerzan la credibilidad y autoridad profesional ante sistemas automatizados.`,
    },
  ];
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
    const authorityLinks = extractAuthorityPlatformLinks(context.html);
    const linkFindings = evaluateAuthorityLinks(authorityLinks);

    const authorMetadata = extractAuthorMetadata(context.html);
    const authorFindings = evaluateAuthorMetadata(authorMetadata);

    const dateMetadata = extractDateMetadata(context.html);
    const dateFindings = evaluateDateMetadata(dateMetadata);

    const achievementKeywords = detectAchievementMentions(context.html);
    const achievementFindings = evaluateAchievementMentions(achievementKeywords);

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
