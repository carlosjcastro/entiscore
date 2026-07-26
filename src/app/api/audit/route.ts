import { type NextRequest } from "next/server";
import { ZodError } from "zod";
import { AuditRequestSchema, validateUrlSafety } from "./validation";
import { runAuditWithMetadata } from "@/agent/orchestrator";
import { extractSiteMetadata } from "@/lib/site-metadata";
import { saveAnalysis } from "@/lib/persistence";
import type { AuditErrorResponse } from "@/types";

const GLOBAL_TIMEOUT_MS = 55_000;

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function buildErrorResponse(
  status: number,
  errorResponse: AuditErrorResponse
): Response {
  return Response.json(errorResponse, { status, headers: CORS_HEADERS });
}

function extractZodErrorDetails(error: ZodError): string {
  return error.issues
    .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
    .join("; ");
}

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
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return buildErrorResponse(400, {
      error: "El body de la request no es JSON válido",
      code: "INVALID_URL",
    });
  }

  const parseResult = AuditRequestSchema.safeParse(body);
  if (!parseResult.success) {
    return buildErrorResponse(400, {
      error: "La URL proporcionada no es válida",
      code: "INVALID_URL",
      details: extractZodErrorDetails(parseResult.error),
    });
  }

  const { url } = parseResult.data;

  const safetyResult = await validateUrlSafety(url);
  if (!safetyResult.valid) {
    return buildErrorResponse(403, {
      error: "La URL no está permitida por razones de seguridad",
      code: "FORBIDDEN_URL",
      details: safetyResult.details,
    });
  }

  try {
    const { report, html } = await executeWithTimeout(
      runAuditWithMetadata(url),
      GLOBAL_TIMEOUT_MS
    );

    const metadata = extractSiteMetadata(html, url);

    const code = await saveAnalysis(report, {
      siteName: metadata.siteName,
      faviconUrl: metadata.faviconUrl,
    });

    const responsePayload = {
      ...report,
      code: code ?? undefined,
      siteName: metadata.siteName,
      faviconUrl: metadata.faviconUrl,
    };

    return Response.json(responsePayload, { status: 200, headers: CORS_HEADERS });
  } catch (error) {
    if (error instanceof Error && error.message === "TIMEOUT") {
      return buildErrorResponse(504, {
        error: "El análisis excedió el tiempo máximo permitido",
        code: "TIMEOUT",
      });
    }

    console.error("Error inesperado en /api/audit:", error);

    return buildErrorResponse(500, {
      error: "Ocurrió un error interno durante el análisis",
      code: "INTERNAL_ERROR",
    });
  }
}
