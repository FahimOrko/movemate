import { Router } from 'express';
import * as controller from './move.controller';

export const moveRouter = Router();

moveRouter.post('/moves', controller.create);
moveRouter.get('/moves/current', controller.getCurrent);
moveRouter.post('/moves/:id/advance', controller.advance);
