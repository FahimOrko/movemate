import type { Request, Response } from 'express';
import { moveIdParamsSchema } from '../move/move.schemas';
import { reportIdParamsSchema } from './report.schemas';
import * as service from './report.service';

export async function generate(req: Request, res: Response) {
  const { id } = moveIdParamsSchema.parse(req.params);
  res.status(201).json({ data: await service.generate(id) });
}

export async function getById(req: Request, res: Response) {
  const { id } = reportIdParamsSchema.parse(req.params);
  res.json({ data: await service.getById(id) });
}

export async function getLatest(req: Request, res: Response) {
  const { id } = moveIdParamsSchema.parse(req.params);
  res.json({ data: await service.getLatest(id) });
}
