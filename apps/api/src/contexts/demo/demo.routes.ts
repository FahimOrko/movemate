import { Router } from 'express';
import * as controller from './demo.controller';

export const demoRouter = Router();

demoRouter.get('/demo/contract', controller.sendContract);
