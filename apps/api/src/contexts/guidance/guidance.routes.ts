import { Router } from 'express';
import * as controller from './guidance.controller';

export const guidanceRouter = Router();

guidanceRouter.get('/guidance/prepare', controller.getPrepareGuidance);
guidanceRouter.get('/guidance/providers', controller.getProviders);
guidanceRouter.get('/moves/:id/guidance', controller.listProgress);
guidanceRouter.patch('/moves/:id/guidance/:itemKey', controller.setProgress);
guidanceRouter.get('/moves/:id/providers/selection', controller.getSelection);
guidanceRouter.put('/moves/:id/providers/selection/:category', controller.setSelection);
