import { z } from "zod";
import { promises as dns } from "node:dns";
import { isStrictlyValidUrl } from "@/lib/url-validation";

export const AuditRequestSchema = z.object({
  url: z
    .string()
    .url()
    .refine(
      (value) => isStrictlyValidUrl(value),
      { message: "The URL format is not valid" }
    ),
  locale: z.enum(["es", "en"]).optional().default("es"),
});

export type AuditRequest = z.infer<typeof AuditRequestSchema>;

interface UrlSafetyValid {
  valid: true;
}

interface UrlSafetyInvalid {
  valid: false;
  code: "FORBIDDEN_URL";
  details: string;
}

export type UrlSafetyResult = UrlSafetyValid | UrlSafetyInvalid;

const BLOCKED_HOSTNAMES = ["localhost"];

function isIpV4InPrivateRange(ip: string): boolean {
  const parts = ip.split(".").map(Number);
  if (parts.length !== 4) return false;

  const [first, second, third] = parts;

  if (first === 127) return true;
  if (first === 10) return true;
  if (first === 172 && second !== undefined && second >= 16 && second <= 31)
    return true;
  if (first === 192 && second === 168) return true;
  if (first === 169 && second === 254) return true;
  if (first === 0) return true;

  void third;
  return false;
}

function isIpV6Loopback(ip: string): boolean {
  const normalized = ip.replace(/^\[/, "").replace(/\]$/, "");
  return normalized === "::1" || normalized === "0:0:0:0:0:0:0:1";
}

function isBlockedHostname(hostname: string): boolean {
  return BLOCKED_HOSTNAMES.includes(hostname.toLowerCase());
}

function isLiteralPrivateIp(hostname: string): boolean {
  if (isIpV4InPrivateRange(hostname)) return true;
  if (isIpV6Loopback(hostname)) return true;
  return false;
}

async function resolveHostnameAddresses(
  hostname: string
): Promise<string[]> {
  try {
    const addresses = await dns.resolve4(hostname);
    return addresses;
  } catch {
    try {
      const addresses = await dns.resolve6(hostname);
      return addresses;
    } catch {
      return [];
    }
  }
}

function checkResolvedAddresses(addresses: string[]): UrlSafetyResult {
  for (const address of addresses) {
    if (isIpV4InPrivateRange(address)) {
      return {
        valid: false,
        code: "FORBIDDEN_URL",
        details: `La URL resuelve a una IP privada (${address}) que no esta permitida`,
      };
    }
    if (isIpV6Loopback(address)) {
      return {
        valid: false,
        code: "FORBIDDEN_URL",
        details: `La URL resuelve a una IP loopback IPv6 (${address}) que no esta permitida`,
      };
    }
  }
  return { valid: true };
}

export async function validateUrlSafety(url: string): Promise<UrlSafetyResult> {
  const parsedUrl = new URL(url);
  const hostname = parsedUrl.hostname;

  if (isBlockedHostname(hostname)) {
    return {
      valid: false,
      code: "FORBIDDEN_URL",
      details: `El hostname "${hostname}" no esta permitido`,
    };
  }

  if (isLiteralPrivateIp(hostname)) {
    return {
      valid: false,
      code: "FORBIDDEN_URL",
      details: `La IP "${hostname}" pertenece a un rango privado o reservado`,
    };
  }

  const resolvedAddresses = await resolveHostnameAddresses(hostname);

  if (resolvedAddresses.length === 0) {
    return { valid: true };
  }

  return checkResolvedAddresses(resolvedAddresses);
}
