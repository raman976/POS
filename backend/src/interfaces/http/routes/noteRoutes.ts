import { Router } from 'express';
import { NoteController } from '../controllers/NoteController';
import { authMiddleware } from '../middleware/authMiddleware';
import { JwtService } from '../../../infrastructure/security/jwt';

export const noteRoutes = (
  noteController: NoteController,
  jwtService: JwtService,
): Router => {
  const router = Router();

  router.post('/', authMiddleware(jwtService), noteController.create);
  router.get('/', authMiddleware(jwtService), noteController.list);

  return router;
};
