import {
  FetchRobotsTxtInputSchema,
  type FetchRobotsTxtInput,
  type FetchRobotsTxtOutput,
} from "@/types/mcp-tools";

const FETCH_ROBOTS_TIMEOUT_MS = 5_000;

function buildRobotsTxtUrl(baseUrl: string): string {
  const parsedUrl = new URL(baseUrl);
  return `${parsedUrl.origin}/robots.txt`;
}

export async function fetchRobotsTxt(
  input: FetchRobotsTxtInput
): Promise<FetchRobotsTxtOutput> {
  const validatedInput = FetchRobotsTxtInputSchema.parse(input);
  const robotsTxtUrl = buildRobotsTxtUrl(validatedInput.baseUrl);

  try {
    const response = await fetch(robotsTxtUrl, {
      signal: AbortSignal.timeout(FETCH_ROBOTS_TIMEOUT_MS),
      headers: {
        "User-Agent": "Entiscore/1.0 (Digital Entity Auditor)",
      },
      redirect: "follow",
    });

    if (!response.ok) {
      return { content: null, accessible: false };
    }

    const content = await response.text();
    return { content, accessible: true };
  } catch {
    return { content: null, accessible: false };
  }
}
