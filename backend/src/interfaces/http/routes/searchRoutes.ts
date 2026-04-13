import { Router } from 'express';
import { SearchController } from '../controllers/SearchController';
import { authMiddleware } from '../middleware/authMiddleware';
import { JwtService } from '../../../infrastructure/security/jwt';

export const searchRoutes = (ctrl: SearchController, jwtService: JwtService): Router => {
  const router = Router()
  router.get('/', authMiddleware(jwtService), ctrl.search)
  return router
}
