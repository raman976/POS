import { Router } from 'express';
import { PasswordVaultController } from '../controllers/PasswordVaultController';
import { authMiddleware } from '../middleware/authMiddleware';
import { JwtService } from '../../../infrastructure/security/jwt';

export const passwordVaultRoutes = (ctrl: PasswordVaultController, jwtService: JwtService): Router => {
  const router = Router()
  const auth = authMiddleware(jwtService)

  router.post('/', auth, ctrl.add)
  router.get('/', auth, ctrl.list)
  router.get('/:id/reveal', auth, ctrl.reveal)
  router.patch('/:id', auth, ctrl.update)
  router.delete('/:id', auth, ctrl.remove)

  return router
}
