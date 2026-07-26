import { describe, it, expect } from "vitest";
import { calculateOverallScore } from "./scoring";
import type { AxisResult } from "@/types";

function buildAxisResult(score: number, status: "evaluated" | "partial" | "failed" = "evaluated"): AxisResult {
  return { score, status, findings: [] };
}

describe("calculateOverallScore", () => {
  it("calculates weighted average with all four axes evaluated", () => {
    const result = calculateOverallScore({
      structuredData: buildAxisResult(100),
      identityConsistency: buildAxisResult(50),
      authoritySignals: buildAxisResult(50),
      technicalAccessibility: buildAxisResult(100),
    });

    expect(result.overallScore).toBe(80);
  });

  it("excludes axes with status failed and redistributes weight", () => {
    const result = calculateOverallScore({
      structuredData: buildAxisResult(60),
      identityConsistency: buildAxisResult(0, "failed"),
      authoritySignals: buildAxisResult(0, "failed"),
      technicalAccessibility: buildAxisResult(60),
    });

    expect(result.overallScore).toBe(60);
  });

  it("excludes axes with status partial and redistributes weight", () => {
    const result = calculateOverallScore({
      structuredData: buildAxisResult(0),
      identityConsistency: buildAxisResult(0, "partial"),
      authoritySignals: buildAxisResult(0, "partial"),
      technicalAccessibility: buildAxisResult(60),
    });

    expect(result.overallScore).toBe(30);
  });

  it("returns 0 when all axes are failed", () => {
    const result = calculateOverallScore({
      structuredData: buildAxisResult(0, "failed"),
      identityConsistency: buildAxisResult(0, "failed"),
      authoritySignals: buildAxisResult(0, "failed"),
      technicalAccessibility: buildAxisResult(0, "failed"),
    });

    expect(result.overallScore).toBe(0);
  });

  it("maps score 0-39 to maturityLevel bajo", () => {
    const result = calculateOverallScore({
      structuredData: buildAxisResult(30),
      identityConsistency: buildAxisResult(30),
      authoritySignals: buildAxisResult(30),
      technicalAccessibility: buildAxisResult(30),
    });

    expect(result.maturityLevel).toBe("bajo");
  });

  it("maps score 40-59 to maturityLevel medio", () => {
    const result = calculateOverallScore({
      structuredData: buildAxisResult(50),
      identityConsistency: buildAxisResult(50),
      authoritySignals: buildAxisResult(50),
      technicalAccessibility: buildAxisResult(50),
    });

    expect(result.maturityLevel).toBe("medio");
  });

  it("maps score 60-79 to maturityLevel alto", () => {
    const result = calculateOverallScore({
      structuredData: buildAxisResult(70),
      identityConsistency: buildAxisResult(70),
      authoritySignals: buildAxisResult(70),
      technicalAccessibility: buildAxisResult(70),
    });

    expect(result.maturityLevel).toBe("alto");
  });

  it("maps score 80-100 to maturityLevel excelente", () => {
    const result = calculateOverallScore({
      structuredData: buildAxisResult(90),
      identityConsistency: buildAxisResult(90),
      authoritySignals: buildAxisResult(90),
      technicalAccessibility: buildAxisResult(90),
    });

    expect(result.maturityLevel).toBe("excelente");
  });

  it("maps exactly 80 to excelente", () => {
    const result = calculateOverallScore({
      structuredData: buildAxisResult(80),
      identityConsistency: buildAxisResult(80),
      authoritySignals: buildAxisResult(80),
      technicalAccessibility: buildAxisResult(80),
    });

    expect(result.maturityLevel).toBe("excelente");
  });

  it("maps exactly 40 to medio", () => {
    const result = calculateOverallScore({
      structuredData: buildAxisResult(40),
      identityConsistency: buildAxisResult(40),
      authoritySignals: buildAxisResult(40),
      technicalAccessibility: buildAxisResult(40),
    });

    expect(result.maturityLevel).toBe("medio");
  });
});
