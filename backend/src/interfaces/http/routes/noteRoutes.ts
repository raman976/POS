import { Router } from 'express';
import { NoteController } from '../controllers/NoteController';
import { authMiddleware } from '../middleware/authMiddleware';
import { JwtService } from '../../../infrastructure/security/jwt';

export const noteRoutes = (
  noteController: NoteController,
  jwtService: JwtService,
): Router => {
  const router = Router();
  const auth = authMiddleware(jwtService);

  router.post('/', auth, noteController.create);
  router.get('/', auth, noteController.list);
  router.patch('/:id', auth, noteController.update);
  router.delete('/:id', auth, noteController.remove);

  return router;
};
