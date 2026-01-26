import { z } from "zod";
import { InfluencerStatuses } from "./influencer.model";

export const CreateInfluencerSchema = z.object({
  user_id: z.string().min(1, "User ID is required"),
  status: z.enum(InfluencerStatuses).default("pending"),
  notes: z.string().nullable().optional(),
});

export const UpdateInfluencerSchema = z.object({
  status: z.enum(InfluencerStatuses).optional(),
  notes: z.string().nullable().optional(),
});

export const ListInfluencersQuerySchema = z.object({
  status: z.enum(InfluencerStatuses).optional(),
  limit: z.coerce.number().min(1).max(100).default(50),
  skip: z.coerce.number().min(0).default(0),
});

// Type exports
export type CreateInfluencerDTO = z.infer<typeof CreateInfluencerSchema>;
export type UpdateInfluencerDTO = z.infer<typeof UpdateInfluencerSchema>;
export type ListInfluencersQueryDTO = z.infer<typeof ListInfluencersQuerySchema>;
