import { MAX_CHECK_LENGTH } from '@movemate/contracts';
import { z } from 'zod';

export const checkIdParamsSchema = z.object({ id: z.uuid() });

// The 8-check limit is applied by the service: a longer list is cut, not retried against the free-tier quota.
export const baselineOutputSchema = z.object({
  checks: z.array(z.string().trim().min(1).max(MAX_CHECK_LENGTH)),
});
