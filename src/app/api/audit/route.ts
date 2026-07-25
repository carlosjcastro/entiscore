import { type NextRequest } from "next/server";
import { ZodError } from "zod";
import { AuditRequestSchema, validateUrlSafety } from "./validation";
import { runAudit } from "@/agent/orchestrator";
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
      error: "El body de la request no es JSON valido",
      code: "INVALID_URL",
    });
  }

  const parseResult = AuditRequestSchema.safeParse(body);
  if (!parseResult.success) {
    return buildErrorResponse(400, {
      error: "La URL proporcionada no es valida",
      code: "INVALID_URL",
      details: extractZodErrorDetails(parseResult.error),
    });
  }

  const { url } = parseResult.data;

  const safetyResult = await validateUrlSafety(url);
  if (!safetyResult.valid) {
    return buildErrorResponse(403, {
      error: "La URL no esta permitida por razones de seguridad",
      code: "FORBIDDEN_URL",
      details: safetyResult.details,
    });
  }

  try {
    const auditResponse = await executeWithTimeout(
      runAudit(url),
      GLOBAL_TIMEOUT_MS
    );

    return Response.json(auditResponse, { status: 200, headers: CORS_HEADERS });
  } catch (error) {
    if (error instanceof Error && error.message === "TIMEOUT") {
      return buildErrorResponse(504, {
        error: "El analisis excedio el tiempo maximo permitido",
        code: "TIMEOUT",
      });
    }

    console.error("Error inesperado en /api/audit:", error);

    return buildErrorResponse(500, {
      error: "Ocurrio un error interno durante el analisis",
      code: "INTERNAL_ERROR",
    });
  }
}
