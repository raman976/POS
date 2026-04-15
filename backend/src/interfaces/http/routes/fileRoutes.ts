import { Router } from 'express';
import multer from 'multer';
import { FileController } from '../controllers/FileController';
import { authMiddleware } from '../middleware/authMiddleware';
import { JwtService } from '../../../infrastructure/security/jwt';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }
})

export const fileRoutes = (ctrl: FileController, jwtService: JwtService): Router => {
  const router = Router()
  const auth = authMiddleware(jwtService)

  router.post('/upload', auth, upload.single('file'), ctrl.upload)
  router.post('/folders', auth, ctrl.createFolder)
  router.get('/', auth, ctrl.list)
  router.get('/:id/download', auth, ctrl.download)
  router.delete('/:id', auth, ctrl.remove)

  return router
}
