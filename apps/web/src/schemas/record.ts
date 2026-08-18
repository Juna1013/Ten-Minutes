import { z } from "zod";

export const savedRecordSchema = z.object({
    id: z.number().int().positive(),
    elapsed_time: z.number().positive().max(60),
    difference: z.number().nonnegative(),
    created_at: z.iso.datetime({ offset: true }),
});

export type SavedRecord = z.infer<typeof savedRecordSchema>;