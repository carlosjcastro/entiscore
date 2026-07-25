import * as cheerio from "cheerio";
import type { Analyzer, AnalysisContext, AxisResult, Finding } from "@/types";

const EXPECTED_FIELDS_BY_TYPE: Record<string, string[]> = {
  Person: ["name", "jobTitle", "url", "sameAs", "image", "description", "email"],
  Organization: ["name", "url", "logo", "sameAs", "description", "contactPoint"],
  WebSite: ["name", "url", "description", "publisher", "potentialAction"],
  ProfilePage: ["name", "url", "mainEntity", "description"],
};

const RECOGNIZED_SCHEMA_TYPES = Object.keys(EXPECTED_FIELDS_BY_TYPE);

const SCORE_WEIGHT_SCHEMA_PRESENCE = 30;
const SCORE_WEIGHT_RELEVANT_TYPE = 20;
const SCORE_WEIGHT_FIELD_COMPLETENESS = 50;

interface DetectedSchema {
  type: string;
  fields: Record<string, unknown>;
  source: "json-ld" | "microdata" | "rdfa";
}

function extractJsonLdSchemas(html: string): DetectedSchema[] {
  const $ = cheerio.load(html);
  const schemas: DetectedSchema[] = [];

  $('script[type="application/ld+json"]').each((_, element) => {
    const rawContent = $(element).html();
    if (!rawContent) return;

    try {
      const parsed: unknown = JSON.parse(rawContent);
      const items = Array.isArray(parsed) ? parsed : [parsed];

      for (const item of items) {
        if (typeof item === "object" && item !== null && "@type" in item) {
          const typedItem = item as Record<string, unknown>;
          const schemaType = String(typedItem["@type"]);
          schemas.push({ type: schemaType, fields: typedItem, source: "json-ld" });
        }
      }
    } catch {
      return;
    }
  });

  return schemas;
}

function extractMicrodataSchemas(html: string): DetectedSchema[] {
  const $ = cheerio.load(html);
  const schemas: DetectedSchema[] = [];

  $("[itemscope][itemtype]").each((_, element) => {
    const itemtype = $(element).attr("itemtype") ?? "";
    const typeMatch = itemtype.match(/schema\.org\/(\w+)/);
    if (!typeMatch?.[1]) return;

    const fields: Record<string, unknown> = {};
    $(element)
      .find("[itemprop]")
      .each((__, prop) => {
        const propName = $(prop).attr("itemprop") ?? "";
        const propValue = $(prop).attr("content") ?? $(prop).text().trim();
        if (propName) fields[propName] = propValue;
      });

    schemas.push({ type: typeMatch[1], fields, source: "microdata" });
  });

  return schemas;
}

function extractRdfaSchemas(html: string): DetectedSchema[] {
  const $ = cheerio.load(html);
  const schemas: DetectedSchema[] = [];

  $("[typeof]").each((_, element) => {
    const typeofAttr = $(element).attr("typeof") ?? "";
    const typeMatch = typeofAttr.match(/(?:schema:)?(\w+)/);
    if (!typeMatch?.[1]) return;

    const fields: Record<string, unknown> = {};
    $(element)
      .find("[property]")
      .each((__, prop) => {
        const propName = $(prop).attr("property") ?? "";
        const propValue = $(prop).attr("content") ?? $(prop).text().trim();
        if (propName) fields[propName] = propValue;
      });

    schemas.push({ type: typeMatch[1], fields, source: "rdfa" });
  });

  return schemas;
}

function findAllSchemas(html: string): DetectedSchema[] {
  return [
    ...extractJsonLdSchemas(html),
    ...extractMicrodataSchemas(html),
    ...extractRdfaSchemas(html),
  ];
}

function isRecognizedType(schemaType: string): boolean {
  return RECOGNIZED_SCHEMA_TYPES.includes(schemaType);
}

function getExpectedFields(schemaType: string): string[] {
  return EXPECTED_FIELDS_BY_TYPE[schemaType] ?? [];
}

function fieldHasValue(value: unknown): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === "string" && value.trim() === "") return false;
  if (Array.isArray(value) && value.length === 0) return false;
  return true;
}

function evaluateFieldCompleteness(
  schema: DetectedSchema,
  expectedFields: string[]
): { presentFields: string[]; missingFields: string[]; emptyFields: string[] } {
  const presentFields: string[] = [];
  const missingFields: string[] = [];
  const emptyFields: string[] = [];

  for (const field of expectedFields) {
    if (!(field in schema.fields)) {
      missingFields.push(field);
    } else if (!fieldHasValue(schema.fields[field])) {
      emptyFields.push(field);
    } else {
      presentFields.push(field);
    }
  }

  return { presentFields, missingFields, emptyFields };
}

function buildNoSchemaFindings(): Finding[] {
  return [
    {
      type: "critical",
      title: "No se encontro schema markup en el sitio",
      description:
        "El sitio no tiene datos estructurados que permitan a buscadores e IA interpretar la identidad de forma precisa.",
      details:
        "Se recomienda agregar al menos un bloque JSON-LD con el tipo mas adecuado segun el contenido del sitio (Person para portfolios personales, Organization para empresas).",
    },
  ];
}

function buildSchemaTypeFindings(schemas: DetectedSchema[]): Finding[] {
  const findings: Finding[] = [];

  for (const schema of schemas) {
    if (isRecognizedType(schema.type)) {
      findings.push({
        type: "positive",
        title: `Schema de tipo ${schema.type} detectado (${schema.source})`,
        description: `Se encontro un schema markup de tipo ${schema.type} que es relevante para la identidad digital.`,
      });
    } else {
      findings.push({
        type: "warning",
        title: `Schema de tipo ${schema.type} detectado pero no es un tipo de identidad reconocido`,
        description: `El tipo ${schema.type} existe pero no es uno de los tipos principales para describir una persona o proyecto.`,
      });
    }
  }

  return findings;
}

function buildFieldCompletenessFindings(
  schema: DetectedSchema,
  presentFields: string[],
  missingFields: string[],
  emptyFields: string[]
): Finding[] {
  const findings: Finding[] = [];

  if (presentFields.length > 0) {
    findings.push({
      type: "positive",
      title: `Campos completos en ${schema.type}`,
      description: `Los siguientes campos estan correctamente definidos: ${presentFields.join(", ")}.`,
    });
  }

  if (missingFields.length > 0) {
    findings.push({
      type: "warning",
      title: `Campos faltantes en ${schema.type}`,
      description: `Los siguientes campos recomendados no estan presentes: ${missingFields.join(", ")}.`,
      details: `Agregar estos campos mejora la capacidad de buscadores e IA para entender la entidad representada.`,
    });
  }

  if (emptyFields.length > 0) {
    findings.push({
      type: "warning",
      title: `Campos vacios en ${schema.type}`,
      description: `Los siguientes campos existen pero tienen valores vacios: ${emptyFields.join(", ")}.`,
    });
  }

  return findings;
}

function calculateScore(schemas: DetectedSchema[]): number {
  if (schemas.length === 0) return 0;

  let score = SCORE_WEIGHT_SCHEMA_PRESENCE;

  const recognizedSchemas = schemas.filter((s) => isRecognizedType(s.type));
  if (recognizedSchemas.length > 0) {
    score += SCORE_WEIGHT_RELEVANT_TYPE;
  }

  if (recognizedSchemas.length > 0) {
    const primarySchema = recognizedSchemas[0]!;
    const expectedFields = getExpectedFields(primarySchema.type);

    if (expectedFields.length > 0) {
      const { presentFields } = evaluateFieldCompleteness(
        primarySchema,
        expectedFields
      );
      const completenessRatio = presentFields.length / expectedFields.length;
      score += Math.round(SCORE_WEIGHT_FIELD_COMPLETENESS * completenessRatio);
    }
  }

  return Math.min(score, 100);
}

export const structuredDataAnalyzer: Analyzer = {
  async analyze(context: AnalysisContext): Promise<AxisResult> {
    const schemas = findAllSchemas(context.html);

    if (schemas.length === 0) {
      return {
        score: 0,
        status: "evaluated",
        findings: buildNoSchemaFindings(),
      };
    }

    const findings: Finding[] = [];

    findings.push(...buildSchemaTypeFindings(schemas));

    const recognizedSchemas = schemas.filter((s) => isRecognizedType(s.type));
    for (const schema of recognizedSchemas) {
      const expectedFields = getExpectedFields(schema.type);
      const { presentFields, missingFields, emptyFields } =
        evaluateFieldCompleteness(schema, expectedFields);
      findings.push(
        ...buildFieldCompletenessFindings(
          schema,
          presentFields,
          missingFields,
          emptyFields
        )
      );
    }

    const score = calculateScore(schemas);

    return { score, status: "evaluated", findings };
  },
};
