import { Router } from 'express';
import { TaskController } from '../controllers/TaskController';
import { authMiddleware } from '../middleware/authMiddleware';
import { JwtService } from '../../../infrastructure/security/jwt';

export const taskRoutes = (ctrl: TaskController, jwtService: JwtService): Router => {
  const router = Router()
  const auth = authMiddleware(jwtService)

  router.post('/', auth, ctrl.create)
  router.get('/', auth, ctrl.list)
  router.get('/:id', auth, ctrl.getOne)
  router.patch('/:id', auth, ctrl.update)
  router.delete('/:id', auth, ctrl.remove)

  return router
}
