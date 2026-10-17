import { createFindingSchema, createRoomCheckSchema, resolveFindingSchema, roomSelectionSchema } from '@movemate/contracts';
import type { Request, Response } from 'express';
import { moveIdParamsSchema } from '../move/move.schemas';
import { checkIdParamsSchema, findingIdParamsSchema } from './inspection.schemas';
import * as service from './inspection.service';

export async function runBaseline(req: Request, res: Response) {
  const { id } = moveIdParamsSchema.parse(req.params);
  const { rooms } = roomSelectionSchema.parse(req.body ?? {});
  res.json({ data: await service.runBaseline(id, rooms) });
}

export async function list(req: Request, res: Response) {
  const { id } = moveIdParamsSchema.parse(req.params);
  res.json({ data: await service.listChecks(id) });
}

export async function add(req: Request, res: Response) {
  const { id } = moveIdParamsSchema.parse(req.params);
  res.status(201).json({ data: await service.addCheck(id, createRoomCheckSchema.parse(req.body)) });
}

export async function remove(req: Request, res: Response) {
  const { id } = checkIdParamsSchema.parse(req.params);
  await service.deleteCheck(id);
  res.status(204).end();
}

export async function runCompare(req: Request, res: Response) {
  const { id } = moveIdParamsSchema.parse(req.params);
  const { rooms } = roomSelectionSchema.parse(req.body ?? {});
  res.json({ data: await service.runCompare(id, rooms) });
}

export async function listFindings(req: Request, res: Response) {
  const { id } = moveIdParamsSchema.parse(req.params);
  res.json({ data: await service.listFindings(id) });
}

export async function addFinding(req: Request, res: Response) {
  const { id } = moveIdParamsSchema.parse(req.params);
  res.status(201).json({ data: await service.addFinding(id, createFindingSchema.parse(req.body)) });
}

export async function resolveFinding(req: Request, res: Response) {
  const { id } = findingIdParamsSchema.parse(req.params);
  res.json({ data: await service.resolveFinding(id, resolveFindingSchema.parse(req.body)) });
}

export async function removeFinding(req: Request, res: Response) {
  const { id } = findingIdParamsSchema.parse(req.params);
  await service.deleteFinding(id);
  res.status(204).end();
}
