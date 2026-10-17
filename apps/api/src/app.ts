import type { Health } from '@movemate/contracts';
import express from 'express';
import { demoRouter } from './contexts/demo/demo.routes';
import { guidanceRouter } from './contexts/guidance/guidance.routes';
import { inspectionRouter } from './contexts/inspection/inspection.routes';
import { moveRouter } from './contexts/move/move.routes';
import { photosRouter } from './contexts/photos/photos.routes';
import { reportRouter } from './contexts/report/report.routes';
import { pingDatabase } from './db/client';
import { errorHandler } from './shared/error-handler';
import { AppError } from './shared/errors';

export function createApp() {
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json());

  const api = express.Router();
  api.get('/health', async (_req, res) => {
    try {
      await pingDatabase();
    } catch (error) {
      console.error('Health check failed:', error instanceof Error ? error.message : error);
      throw new AppError('db_unavailable', 'Database is not reachable');
    }
    const data: Health = { status: 'ok', db: 'connected' };
    res.json({ data });
  });
  api.use(demoRouter, moveRouter, guidanceRouter, photosRouter, inspectionRouter, reportRouter);
  api.use(() => {
    throw new AppError('not_found', 'Route not found');
  });

  app.use('/api', api);
  app.use(errorHandler);
  return app;
}
