import type { Request, Response } from 'express';
import * as service from './demo.service';

export async function sendContract(_req: Request, res: Response) {
  const { root, filename } = await service.getLeaseFile();
  res.type('application/pdf').set('Content-Disposition', `inline; filename="${filename}"`);
  await new Promise<void>((resolve, reject) => {
    res.sendFile(filename, { root }, (error) => (error ? reject(error) : resolve()));
  });
}
