import { Router } from 'express';
import * as controller from './inspection.controller';

export const inspectionRouter = Router();

inspectionRouter.post('/moves/:id/inspection/baseline', controller.runBaseline);
inspectionRouter.get('/moves/:id/room-checks', controller.list);
inspectionRouter.post('/moves/:id/room-checks', controller.add);
inspectionRouter.delete('/room-checks/:id', controller.remove);
