import { Router } from 'express';
import * as controller from './report.controller';

export const reportRouter = Router();

reportRouter.post('/moves/:id/reports', controller.generate);
reportRouter.get('/moves/:id/reports/latest', controller.getLatest);
reportRouter.get('/reports/:id', controller.getById);
