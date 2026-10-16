import { Router } from 'express';
import multer from 'multer';
import { env } from '../../env';
import * as controller from './photos.controller';

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: env.MAX_UPLOAD_MB * 1024 * 1024, files: 1 } });

export const photosRouter = Router();

photosRouter.post('/moves/:id/photos', upload.single('file'), controller.upload);
photosRouter.get('/moves/:id/photos', controller.list);
photosRouter.patch('/photos/:id', controller.relabel);
photosRouter.delete('/photos/:id', controller.remove);
photosRouter.get('/photos/:id/file', controller.sendFile);
