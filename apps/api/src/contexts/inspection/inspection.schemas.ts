import { aiStatusSchema, confidenceSchema, MAX_CHECK_LENGTH } from '@movemate/contracts';
import { z } from 'zod';

export const checkIdParamsSchema = z.object({ id: z.uuid() });
export const findingIdParamsSchema = z.object({ id: z.uuid() });

// The 8-check limit is applied by the service: a longer list is cut, not retried against the free-tier quota.
export const baselineOutputSchema = z.object({
  checks: z.array(z.string().trim().min(1).max(MAX_CHECK_LENGTH)),
});

// Loose on purpose: out-of-range indexes, long summaries and extra findings are fixed by the service, not by a retry against the free-tier quota.
export const compareOutputSchema = z.object({
  findings: z.array(
    z.object({
      status: aiStatusSchema,
      summary: z.string().trim().min(1),
      confidence: confidenceSchema,
      check_number: z.number().int().nullable(),
      before_photo_indexes: z.array(z.number().int()),
      move_in_photo_indexes: z.array(z.number().int()),
    }),
  ),
});
export type CompareOutput = z.infer<typeof compareOutputSchema>;
