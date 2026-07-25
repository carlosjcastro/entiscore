import {
  CheckUrlAccessibilityInputSchema,
  type CheckUrlAccessibilityInput,
  type CheckUrlAccessibilityOutput,
} from "@/types/mcp-tools";

const CHECK_ACCESSIBILITY_TIMEOUT_MS = 5_000;

export async function checkUrlAccessibility(
  input: CheckUrlAccessibilityInput
): Promise<CheckUrlAccessibilityOutput> {
  const validatedInput = CheckUrlAccessibilityInputSchema.parse(input);
  const startTime = Date.now();

  try {
    const response = await fetch(validatedInput.url, {
      method: "HEAD",
      signal: AbortSignal.timeout(CHECK_ACCESSIBILITY_TIMEOUT_MS),
      headers: {
        "User-Agent": "Entiscore/1.0 (Digital Entity Auditor)",
      },
      redirect: "follow",
    });

    const responseTimeMs = Date.now() - startTime;

    return {
      accessible: response.ok,
      statusCode: response.status,
      responseTimeMs,
    };
  } catch {
    const responseTimeMs = Date.now() - startTime;
    return { accessible: false, statusCode: 0, responseTimeMs };
  }
}
