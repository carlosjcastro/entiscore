const VALID_HOSTNAME_SEGMENT_PATTERN = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/i;
const VALID_TLD_PATTERN = /^[a-z]{2,}$/i;

interface UrlValidationResult {
  valid: boolean;
  reason?: string;
}

function countProtocolOccurrences(value: string): number {
  const httpMatches = value.match(/https?:\/\//g);
  return httpMatches ? httpMatches.length : 0;
}

function hostnameContainsProtocolWord(hostname: string): boolean {
  return hostname.includes("http") || hostname.includes("https");
}

function isValidHostname(hostname: string): boolean {
  const segments = hostname.split(".");
  if (segments.length < 2) return false;

  const tld = segments[segments.length - 1];
  if (!tld || !VALID_TLD_PATTERN.test(tld)) return false;

  for (const segment of segments) {
    if (!segment || segment.length === 0) return false;
    if (!VALID_HOSTNAME_SEGMENT_PATTERN.test(segment)) return false;
  }

  return true;
}

export function validateUrlStrict(value: string): UrlValidationResult {
  const trimmed = value.trim();

  if (trimmed.length === 0) {
    return { valid: false, reason: "empty" };
  }

  if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
    return { valid: false, reason: "protocol" };
  }

  if (countProtocolOccurrences(trimmed) > 1) {
    return { valid: false, reason: "duplicate_protocol" };
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(trimmed);
  } catch {
    return { valid: false, reason: "malformed" };
  }

  if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
    return { valid: false, reason: "protocol" };
  }

  const hostname = parsedUrl.hostname;

  if (hostnameContainsProtocolWord(hostname)) {
    return { valid: false, reason: "hostname_contains_protocol" };
  }

  if (!isValidHostname(hostname)) {
    return { valid: false, reason: "invalid_hostname" };
  }

  return { valid: true };
}

export function isStrictlyValidUrl(value: string): boolean {
  return validateUrlStrict(value).valid;
}
