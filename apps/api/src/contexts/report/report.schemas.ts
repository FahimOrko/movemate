import { z } from 'zod';

export const reportIdParamsSchema = z.object({ id: z.uuid() });
