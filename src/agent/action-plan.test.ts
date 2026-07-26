import { describe, it, expect } from "vitest";
import { generateActionPlan } from "./action-plan";
import type { AxisResult } from "@/types";

function buildAxisWithFindings(findings: { type: "positive" | "warning" | "critical"; title: string }[]): AxisResult {
  return {
    score: 50,
    status: "evaluated",
    findings: findings.map((f) => ({ ...f, description: "test description" })),
  };
}

describe("generateActionPlan", () => {
  it("prioritizes critical findings over warnings", () => {
    const result = generateActionPlan({
      structuredData: buildAxisWithFindings([
        { type: "warning", title: "Warning in SD" },
      ]),
      identityConsistency: buildAxisWithFindings([]),
      authoritySignals: buildAxisWithFindings([]),
      technicalAccessibility: buildAxisWithFindings([
        { type: "critical", title: "Critical in TA" },
      ]),
    });

    expect(result[0]?.title).toBe("Critical in TA");
    expect(result[1]?.title).toBe("Warning in SD");
  });

  it("respects axis weight order for findings of the same type", () => {
    const result = generateActionPlan({
      structuredData: buildAxisWithFindings([
        { type: "critical", title: "Critical in SD" },
      ]),
      identityConsistency: buildAxisWithFindings([
        { type: "critical", title: "Critical in IC" },
      ]),
      authoritySignals: buildAxisWithFindings([]),
      technicalAccessibility: buildAxisWithFindings([
        { type: "critical", title: "Critical in TA" },
      ]),
    });

    expect(result[0]?.title).toBe("Critical in SD");
    expect(result[1]?.title).toBe("Critical in TA");
    expect(result[2]?.title).toBe("Critical in IC");
  });

  it("guarantees a minimum of 3 recommendations", () => {
    const result = generateActionPlan({
      structuredData: buildAxisWithFindings([
        { type: "warning", title: "One warning" },
      ]),
      identityConsistency: buildAxisWithFindings([]),
      authoritySignals: buildAxisWithFindings([]),
      technicalAccessibility: buildAxisWithFindings([]),
    });

    expect(result.length).toBeGreaterThanOrEqual(3);
  });

  it("excludes positive findings from the action plan", () => {
    const result = generateActionPlan({
      structuredData: buildAxisWithFindings([
        { type: "positive", title: "Good thing" },
        { type: "warning", title: "Bad thing" },
      ]),
      identityConsistency: buildAxisWithFindings([]),
      authoritySignals: buildAxisWithFindings([]),
      technicalAccessibility: buildAxisWithFindings([]),
    });

    const hasPositive = result.some((item) => item.title === "Good thing");
    expect(hasPositive).toBe(false);
  });

  it("assigns sequential priority numbers starting from 1", () => {
    const result = generateActionPlan({
      structuredData: buildAxisWithFindings([
        { type: "critical", title: "First" },
        { type: "warning", title: "Second" },
      ]),
      identityConsistency: buildAxisWithFindings([
        { type: "warning", title: "Third" },
      ]),
      authoritySignals: buildAxisWithFindings([]),
      technicalAccessibility: buildAxisWithFindings([]),
    });

    expect(result[0]?.priority).toBe(1);
    expect(result[1]?.priority).toBe(2);
    expect(result[2]?.priority).toBe(3);
  });

  it("assigns correct axis to each action item", () => {
    const result = generateActionPlan({
      structuredData: buildAxisWithFindings([
        { type: "critical", title: "SD issue" },
      ]),
      identityConsistency: buildAxisWithFindings([]),
      authoritySignals: buildAxisWithFindings([
        { type: "warning", title: "AS issue" },
      ]),
      technicalAccessibility: buildAxisWithFindings([]),
    });

    const sdItem = result.find((item) => item.title === "SD issue");
    const asItem = result.find((item) => item.title === "AS issue");

    expect(sdItem?.axis).toBe("structuredData");
    expect(asItem?.axis).toBe("authoritySignals");
  });
});
