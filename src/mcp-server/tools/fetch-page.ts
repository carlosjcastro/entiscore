import {
  FetchPageInputSchema,
  type FetchPageInput,
  type FetchPageOutput,
} from "@/types/mcp-tools";

const FETCH_PAGE_TIMEOUT_MS = 10_000;

function buildHeadersRecord(headers: Headers): Record<string, string> {
  const headersRecord: Record<string, string> = {};
  headers.forEach((value, key) => {
    headersRecord[key] = value;
  });
  return headersRecord;
}

export async function fetchPage(
  input: FetchPageInput
): Promise<FetchPageOutput> {
  const validatedInput = FetchPageInputSchema.parse(input);
  const startTime = Date.now();

  try {
    const response = await fetch(validatedInput.url, {
      signal: AbortSignal.timeout(FETCH_PAGE_TIMEOUT_MS),
      headers: {
        "User-Agent": "Entiscore/1.0 (Digital Entity Auditor)",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      redirect: "follow",
    });

    const html = await response.text();
    const responseTimeMs = Date.now() - startTime;

    return {
      html,
      statusCode: response.status,
      responseTimeMs,
      headers: buildHeadersRecord(response.headers),
    };
  } catch (error) {
    const responseTimeMs = Date.now() - startTime;

    if (error instanceof DOMException && error.name === "TimeoutError") {
      return { html: "", statusCode: 0, responseTimeMs, headers: {} };
    }

    return { html: "", statusCode: 0, responseTimeMs, headers: {} };
  }
}
