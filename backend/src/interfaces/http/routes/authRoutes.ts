import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { authMiddleware } from '../middleware/authMiddleware';
import { JwtService } from '../../../infrastructure/security/jwt';

export const authRoutes = (
  authController: AuthController,
  jwtService: JwtService,
): Router => {
  const router = Router();

  router.post('/register', authController.register);
  router.post('/login', authController.login);
  router.get('/me', authMiddleware(jwtService), authController.me);
  router.post('/logout', authController.logout);

  return router;
};
