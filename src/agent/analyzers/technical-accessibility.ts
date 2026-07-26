import * as cheerio from "cheerio";
import type { Analyzer, AnalysisContext, AxisResult, Finding } from "@/types";
import { getFinding } from "@/i18n/findings";
import type { Locale } from "@/i18n/types";

const MAX_ACCEPTABLE_RESPONSE_TIME_MS = 5000;
const MIN_VISIBLE_TEXT_LENGTH_FOR_SSR = 100;

const ESSENTIAL_METADATA_SELECTORS: Record<string, string> = {
  title: "title",
  "meta description": 'meta[name="description"]',
  "og:title": 'meta[property="og:title"]',
  "og:description": 'meta[property="og:description"]',
  "og:image": 'meta[property="og:image"]',
};

const SCORE_PENALTY_PER_MISSING_META = 10;
const SCORE_PENALTY_SLOW_RESPONSE = 15;
const SCORE_PENALTY_NON_SUCCESS_STATUS = 30;
const SCORE_PENALTY_ROBOTS_BLOCKS_ALL = 25;
const SCORE_PENALTY_SPA_NO_CONTENT = 30;

function evaluateHttpResponse(statusCode: number, responseTimeMs: number, locale: Locale): Finding[] {
  const findings: Finding[] = [];

  if (statusCode < 200 || statusCode >= 300) {
    const tpl = getFinding(locale, "ta.http_fail", { code: statusCode });
    findings.push({ type: "critical", title: tpl.title, description: tpl.description });
  } else {
    const tpl = getFinding(locale, "ta.http_success", { code: statusCode });
    findings.push({ type: "positive", title: tpl.title, description: tpl.description });
  }

  if (responseTimeMs > MAX_ACCEPTABLE_RESPONSE_TIME_MS) {
    const tpl = getFinding(locale, "ta.response_slow", { ms: responseTimeMs, max: MAX_ACCEPTABLE_RESPONSE_TIME_MS });
    findings.push({ type: "warning", title: tpl.title, description: tpl.description });
  } else {
    const tpl = getFinding(locale, "ta.response_ok", { ms: responseTimeMs });
    findings.push({ type: "positive", title: tpl.title, description: tpl.description });
  }

  return findings;
}

function evaluateEssentialMetadata(html: string, locale: Locale): Finding[] {
  const $ = cheerio.load(html);
  const findings: Finding[] = [];

  for (const [metaName, selector] of Object.entries(ESSENTIAL_METADATA_SELECTORS)) {
    const element = $(selector).first();
    const hasContent = metaName === "title"
      ? element.text().trim().length > 0
      : (element.attr("content") ?? "").trim().length > 0;

    if (element.length === 0 || !hasContent) {
      const tpl = getFinding(locale, "ta.meta_missing", { name: metaName });
      findings.push({ type: "warning", title: tpl.title, description: tpl.description });
    } else {
      const tpl = getFinding(locale, "ta.meta_present", { name: metaName });
      findings.push({ type: "positive", title: tpl.title, description: tpl.description });
    }
  }

  return findings;
}

function robotsTxtBlocksRelevantContent(robotsTxt: string | null, locale: Locale): Finding[] {
  if (robotsTxt === null) {
    const tpl = getFinding(locale, "ta.robots_none");
    return [{ type: "positive", title: tpl.title, description: tpl.description }];
  }

  const lines = robotsTxt.split("\n").map((line) => line.trim().toLowerCase());
  const disallowAllPattern = "disallow: /";
  let appliesToGenericAgent = false;
  let blocksAll = false;

  for (const line of lines) {
    if (line.startsWith("user-agent:")) {
      const agent = line.replace("user-agent:", "").trim();
      appliesToGenericAgent = agent === "*";
    }
    if (appliesToGenericAgent && line === disallowAllPattern) {
      blocksAll = true;
    }
  }

  if (blocksAll) {
    const tpl = getFinding(locale, "ta.robots_blocks");
    return [{ type: "critical", title: tpl.title, description: tpl.description }];
  }

  const tpl = getFinding(locale, "ta.robots_ok");
  return [{ type: "positive", title: tpl.title, description: tpl.description }];
}

function detectSpaWithoutServerRendering(html: string, locale: Locale): Finding[] {
  const $ = cheerio.load(html);
  const bodyText = $("body").text().replace(/\s+/g, " ").trim();

  if (bodyText.length < MIN_VISIBLE_TEXT_LENGTH_FOR_SSR) {
    const tpl = getFinding(locale, "ta.spa_detected", { chars: bodyText.length });
    return [{ type: "critical", title: tpl.title, description: tpl.description, details: tpl.details }];
  }

  const tpl = getFinding(locale, "ta.content_ok", { chars: bodyText.length });
  return [{ type: "positive", title: tpl.title, description: tpl.description }];
}

function calculateScore(findings: Finding[], locale: Locale): number {
  let score = 100;

  const metaMissingKey = getFinding(locale, "ta.meta_missing", { name: "" }).title.split(":")[0] ?? "";
  const missingMetaCount = findings.filter(
    (f) => f.type === "warning" && f.title.startsWith(metaMissingKey)
  ).length;
  score -= missingMetaCount * SCORE_PENALTY_PER_MISSING_META;

  const slowKey = getFinding(locale, "ta.response_slow", { ms: 0, max: 0 }).title;
  const hasSlowResponse = findings.some((f) => f.type === "warning" && f.title === slowKey);
  if (hasSlowResponse) score -= SCORE_PENALTY_SLOW_RESPONSE;

  const httpFailKey = getFinding(locale, "ta.http_fail", { code: 0 }).title;
  const hasNonSuccessStatus = findings.some((f) => f.type === "critical" && f.title === httpFailKey);
  if (hasNonSuccessStatus) score -= SCORE_PENALTY_NON_SUCCESS_STATUS;

  const robotsBlockKey = getFinding(locale, "ta.robots_blocks").title;
  const hasRobotsBlock = findings.some((f) => f.type === "critical" && f.title === robotsBlockKey);
  if (hasRobotsBlock) score -= SCORE_PENALTY_ROBOTS_BLOCKS_ALL;

  const spaKey = getFinding(locale, "ta.spa_detected", { chars: 0 }).title;
  const hasSpaIssue = findings.some((f) => f.type === "critical" && f.title.startsWith(spaKey.split(" ")[0] ?? ""));
  if (hasSpaIssue) score -= SCORE_PENALTY_SPA_NO_CONTENT;

  return Math.max(0, Math.min(100, score));
}

export const technicalAccessibilityAnalyzer: Analyzer = {
  async analyze(context: AnalysisContext): Promise<AxisResult> {
    const locale = context.locale;
    const findings: Finding[] = [];

    findings.push(...evaluateHttpResponse(context.statusCode, context.responseTimeMs, locale));
    findings.push(...evaluateEssentialMetadata(context.html, locale));
    findings.push(...robotsTxtBlocksRelevantContent(context.robotsTxt, locale));
    findings.push(...detectSpaWithoutServerRendering(context.html, locale));

    const score = calculateScore(findings, locale);
    return { score, status: "evaluated", findings };
  },
};
