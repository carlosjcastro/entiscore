import { z } from "zod";

export const FetchPageInputSchema = z.object({
  url: z.string().url(),
});

export type FetchPageInput = z.infer<typeof FetchPageInputSchema>;

export const FetchPageOutputSchema = z.object({
  html: z.string(),
  statusCode: z.number(),
  responseTimeMs: z.number(),
  headers: z.record(z.string(), z.string()),
});

export type FetchPageOutput = z.infer<typeof FetchPageOutputSchema>;

export const FetchRobotsTxtInputSchema = z.object({
  baseUrl: z.string().url(),
});

export type FetchRobotsTxtInput = z.infer<typeof FetchRobotsTxtInputSchema>;

export const FetchRobotsTxtOutputSchema = z.object({
  content: z.string().nullable(),
  accessible: z.boolean(),
});

export type FetchRobotsTxtOutput = z.infer<typeof FetchRobotsTxtOutputSchema>;

export const CheckUrlAccessibilityInputSchema = z.object({
  url: z.string().url(),
});

export type CheckUrlAccessibilityInput = z.infer<
  typeof CheckUrlAccessibilityInputSchema
>;

export const CheckUrlAccessibilityOutputSchema = z.object({
  accessible: z.boolean(),
  statusCode: z.number(),
  responseTimeMs: z.number(),
});

export type CheckUrlAccessibilityOutput = z.infer<
  typeof CheckUrlAccessibilityOutputSchema
>;
