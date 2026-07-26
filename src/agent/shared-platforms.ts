export const RECOGNIZED_PLATFORM_DOMAINS = [
  "github.com",
  "linkedin.com",
  "twitter.com",
  "x.com",
  "medium.com",
  "dev.to",
  "stackoverflow.com",
  "dribbble.com",
  "behance.net",
  "youtube.com",
  "speakerdeck.com",
  "gitlab.com",
  "bitbucket.org",
  "codepen.io",
  "instagram.com",
  "facebook.com",
  "mastodon.social",
  "scholar.google.com",
  "researchgate.net",
  "orcid.org",
  "npmjs.com",
  "pypi.org",
  "hashnode.dev",
  "substack.com",
];

export const AUTHORITY_PLATFORM_DOMAINS = [
  "github.com",
  "linkedin.com",
  "medium.com",
  "dev.to",
  "speakerdeck.com",
  "youtube.com",
  "scholar.google.com",
  "researchgate.net",
  "orcid.org",
  "npmjs.com",
  "pypi.org",
  "stackoverflow.com",
  "gitlab.com",
  "hashnode.dev",
  "substack.com",
];

import * as cheerio from "cheerio";

export function extractSameAsLinksFromSchema(html: string): string[] {
  const $ = cheerio.load(html);
  const sameAsLinks: string[] = [];

  $('script[type="application/ld+json"]').each((_, element) => {
    const rawContent = $(element).html();
    if (!rawContent) return;

    try {
      const parsed: unknown = JSON.parse(rawContent);
      const items = Array.isArray(parsed) ? parsed : [parsed];

      for (const item of items) {
        if (typeof item === "object" && item !== null && "sameAs" in item) {
          const typedItem = item as Record<string, unknown>;
          const sameAs = typedItem["sameAs"];

          if (typeof sameAs === "string") {
            sameAsLinks.push(sameAs);
          } else if (Array.isArray(sameAs)) {
            for (const entry of sameAs) {
              if (typeof entry === "string") {
                sameAsLinks.push(entry);
              }
            }
          }
        }
      }
    } catch {
      return;
    }
  });

  return sameAsLinks;
}

export function filterLinksByDomainList(links: string[], allowedDomains: string[]): string[] {
  const filtered: string[] = [];

  for (const link of links) {
    try {
      const hostname = new URL(link).hostname.replace(/^www\./, "");
      const isAllowed = allowedDomains.some(
        (domain) => hostname === domain || hostname.endsWith(`.${domain}`)
      );
      if (isAllowed && !filtered.includes(link)) {
        filtered.push(link);
      }
    } catch {
      continue;
    }
  }

  return filtered;
}

export function deduplicateByDomain(links: string[]): string[] {
  const seenDomains = new Set<string>();
  const deduplicated: string[] = [];

  for (const link of links) {
    try {
      const hostname = new URL(link).hostname.replace(/^www\./, "");
      if (!seenDomains.has(hostname)) {
        seenDomains.add(hostname);
        deduplicated.push(link);
      }
    } catch {
      continue;
    }
  }

  return deduplicated;
}
