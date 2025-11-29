import { z } from "zod";

/**
 * Schema for validating analytics query parameters
 * Supports multiple timeframe options while maintaining backward compatibility
 */
export const AnalyticsQuerySchema = z.object({
  timeframe: z.enum(["1d", "7d", "30d"]).default("1d"),
});

/**
 * TypeScript type for validated analytics query parameters
 */
export type AnalyticsQuery = z.infer<typeof AnalyticsQuerySchema>;

/**
 * Valid timeframe options for the analytics API
 */
export type Timeframe = "1d" | "7d" | "30d";