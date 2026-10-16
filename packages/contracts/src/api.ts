import { z } from 'zod';

export const errorBodySchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
  }),
});
export type ErrorBody = z.infer<typeof errorBodySchema>;

export const healthSchema = z.object({
  status: z.literal('ok'),
  db: z.literal('connected'),
});
export type Health = z.infer<typeof healthSchema>;
