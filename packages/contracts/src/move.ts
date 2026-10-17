import { z } from 'zod';

export const phaseOrder = ['prepare', 'before_photos', 'move_in', 'report', 'settle_in', 'summary'] as const;
export const phaseSchema = z.enum(phaseOrder);
export type Phase = z.infer<typeof phaseSchema>;

export const moveSchema = z.object({
  id: z.uuid(),
  address: z.string(),
  moveDate: z.iso.date().nullable(),
  phase: phaseSchema,
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});
export type Move = z.infer<typeof moveSchema>;

export const createMoveSchema = z.object({
  address: z.string().trim().min(1, 'Enter the address you are moving into').max(200),
  moveDate: z.iso.date().optional(),
});
export type CreateMove = z.infer<typeof createMoveSchema>;
