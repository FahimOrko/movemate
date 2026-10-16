import { photoStageSchema, roomSchema } from '@movemate/contracts';
import { z } from 'zod';

export const photoIdParamsSchema = z.object({ id: z.uuid() });
export const listPhotosQuerySchema = z.object({ stage: photoStageSchema.optional() });
export const uploadFieldsSchema = z.object({ stage: photoStageSchema, room: roomSchema });
