import * as cheerio from "cheerio";

export interface ExtractedSiteMetadata {
  siteName: string;
  faviconUrl: string | null;
}

function extractFaviconUrl(html: string, baseUrl: string): string | null {
  const $ = cheerio.load(html);

  const iconLink = $('link[rel="icon"], link[rel="shortcut icon"]').first();
  const iconHref = iconLink.attr("href");

  if (iconHref) {
    try {
      return new URL(iconHref, baseUrl).href;
    } catch {
      return iconHref;
    }
  }

  try {
    const origin = new URL(baseUrl).origin;
    return `${origin}/favicon.ico`;
  } catch {
    return null;
  }
}

function extractSiteName(html: string): string {
  const $ = cheerio.load(html);

  const ogSiteName = $('meta[property="og:site_name"]').attr("content")?.trim();
  if (ogSiteName && ogSiteName.length > 0) return ogSiteName;

  const titleText = $("title").text().trim();
  if (titleText.length > 0) return titleText;

  return "Sitio sin nombre";
}

export function extractSiteMetadata(html: string, url: string): ExtractedSiteMetadata {
  return {
    siteName: extractSiteName(html),
    faviconUrl: extractFaviconUrl(html, url),
  };
}
