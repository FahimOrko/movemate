import { z } from 'zod';

export const progressParamsSchema = z.object({
  id: z.uuid(),
  itemKey: z.string().min(1).max(100),
});
