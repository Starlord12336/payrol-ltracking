import { z } from "zod";
import { HolidayType } from "../types";

export const OtPolicySchema = z.object({
  __type: z.literal("OT_POLICY"),
  version: z.literal(1),

  category: z.enum(["OVERTIME", "SHORT_TIME"]),
  appliesOn: z.object({
    weekend: z.boolean(),
    holidayTypes: z.array(z.enum(HolidayType)), // NATIONAL / ORGANIZATIONAL / WEEKLY_REST
  }),

  approval: z.enum(["NONE", "PRE_APPROVAL", "POST_APPROVAL"]),

  calculation: z.discriminatedUnion("method", [
    z.object({ method: z.literal("MULTIPLIER"), multiplier: z.number().min(0).max(10) }),
    z.object({ method: z.literal("FIXED_MINUTES"), minutes: z.number().int().min(0).max(24 * 60) }),
  ]),

  thresholds: z.object({
    dailyMinutes: z.number().int().min(0).max(24 * 60),
    weeklyMinutes: z.number().int().min(0).max(7 * 24 * 60),
  }),
});

export type OtPolicy = z.infer<typeof OtPolicySchema>;

export function encodeOtPolicy(input: Omit<OtPolicy, "__type" | "version">): string {
  return JSON.stringify({ __type: "OT_POLICY", version: 1, ...input } satisfies OtPolicy);
}

export function decodeOtPolicy(description?: string): OtPolicy | null {
  if (!description) return null;
  try {
    const parsed = JSON.parse(description);
    const res = OtPolicySchema.safeParse(parsed);
    return res.success ? res.data : null;
  } catch {
    return null;
  }
}
