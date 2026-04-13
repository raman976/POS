import { Router } from 'express';
import { CalendarEventController } from '../controllers/CalendarEventController';
import { authMiddleware } from '../middleware/authMiddleware';
import { JwtService } from '../../../infrastructure/security/jwt';

export const calendarEventRoutes = (ctrl: CalendarEventController, jwtService: JwtService): Router => {
  const router = Router()
  const auth = authMiddleware(jwtService)

  router.post('/', auth, ctrl.create)
  router.get('/', auth, ctrl.list)
  router.get('/:id', auth, ctrl.getOne)
  router.patch('/:id', auth, ctrl.update)
  router.delete('/:id', auth, ctrl.remove)

  return router
}
