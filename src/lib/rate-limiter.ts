const MAX_REQUESTS_PER_WINDOW = 5;
const WINDOW_DURATION_MS = 60_000;

interface RateLimitEntry {
  count: number;
  windowStart: number;
}

const ipRequestCounts = new Map<string, RateLimitEntry>();

function cleanExpiredEntries() {
  const now = Date.now();
  for (const [ip, entry] of ipRequestCounts.entries()) {
    if (now - entry.windowStart > WINDOW_DURATION_MS) {
      ipRequestCounts.delete(ip);
    }
  }
}

export function isRateLimited(ip: string): boolean {
  cleanExpiredEntries();
  const now = Date.now();
  const existing = ipRequestCounts.get(ip);

  if (!existing || now - existing.windowStart > WINDOW_DURATION_MS) {
    ipRequestCounts.set(ip, { count: 1, windowStart: now });
    return false;
  }

  existing.count++;

  if (existing.count > MAX_REQUESTS_PER_WINDOW) {
    return true;
  }

  return false;
}
