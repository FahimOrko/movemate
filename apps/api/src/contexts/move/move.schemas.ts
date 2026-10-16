import { z } from 'zod';

export const moveIdParamsSchema = z.object({ id: z.uuid() });
