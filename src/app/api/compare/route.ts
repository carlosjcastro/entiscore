import { type NextRequest } from "next/server";
import { z } from "zod";
import { validateUrlSafety } from "@/app/api/audit/validation";
import { runAuditWithMetadata } from "@/agent/orchestrator";
import { extractSiteMetadata } from "@/lib/site-metadata";
import { saveComparison } from "@/lib/persistence";
import { isStrictlyValidUrl } from "@/lib/url-validation";
import { isRateLimited } from "@/lib/rate-limiter";

const GLOBAL_TIMEOUT_MS = 55_000;

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const CompareRequestSchema = z.object({
  urlA: z.string().url().refine((v) => isStrictlyValidUrl(v), { message: "URL A is not valid" }),
  urlB: z.string().url().refine((v) => isStrictlyValidUrl(v), { message: "URL B is not valid" }),
  locale: z.enum(["es", "en"]).optional().default("es"),
});

async function executeWithTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number
): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) => {
    const timer = setTimeout(() => {
      clearTimeout(timer);
      reject(new Error("TIMEOUT"));
    }, timeoutMs);
  });

  return Promise.race([promise, timeoutPromise]);
}

export async function OPTIONS(): Promise<Response> {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export async function POST(request: NextRequest): Promise<Response> {
  const clientIp = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  if (isRateLimited(clientIp)) {
    return Response.json(
      { error: "Too many requests. Please wait a moment before trying again.", code: "RATE_LIMITED" },
      { status: 429, headers: CORS_HEADERS }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json(
      { error: "El body de la request no es JSON válido" },
      { status: 400, headers: CORS_HEADERS }
    );
  }

  const parseResult = CompareRequestSchema.safeParse(body);
  if (!parseResult.success) {
    return Response.json(
      { error: "Ambas URLs deben ser válidas" },
      { status: 400, headers: CORS_HEADERS }
    );
  }

  const { urlA, urlB, locale } = parseResult.data;

  const [safetyA, safetyB] = await Promise.all([
    validateUrlSafety(urlA),
    validateUrlSafety(urlB),
  ]);

  if (!safetyA.valid) {
    return Response.json(
      { error: `URL A no está permitida: ${safetyA.details}` },
      { status: 403, headers: CORS_HEADERS }
    );
  }

  if (!safetyB.valid) {
    return Response.json(
      { error: `URL B no está permitida: ${safetyB.details}` },
      { status: 403, headers: CORS_HEADERS }
    );
  }

  try {
    const [resultA, resultB] = await executeWithTimeout(
      Promise.all([runAuditWithMetadata(urlA, locale), runAuditWithMetadata(urlB, locale)]),
      GLOBAL_TIMEOUT_MS
    );

    const metadataA = extractSiteMetadata(resultA.html, urlA);
    const metadataB = extractSiteMetadata(resultB.html, urlB);

    const code = await saveComparison(
      resultA.report,
      resultB.report,
      { siteName: metadataA.siteName, faviconUrl: metadataA.faviconUrl },
      { siteName: metadataB.siteName, faviconUrl: metadataB.faviconUrl }
    );

    const responsePayload = {
      reportA: resultA.report,
      reportB: resultB.report,
      siteNameA: metadataA.siteName,
      siteNameB: metadataB.siteName,
      faviconUrlA: metadataA.faviconUrl,
      faviconUrlB: metadataB.faviconUrl,
      code: code ?? undefined,
    };

    return Response.json(responsePayload, { status: 200, headers: CORS_HEADERS });
  } catch (error) {
    if (error instanceof Error && error.message === "TIMEOUT") {
      return Response.json(
        { error: "La comparación excedió el tiempo máximo permitido" },
        { status: 504, headers: CORS_HEADERS }
      );
    }

    console.error("Error inesperado en /api/compare:", error);

    return Response.json(
      { error: "Ocurrió un error interno durante la comparación" },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
