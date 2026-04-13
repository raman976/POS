import { NextFunction, Request, Response } from 'express';
import { JwtService } from '../../../infrastructure/security/jwt';

export const authMiddleware = (jwtService: JwtService) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const token = req.cookies?.session_token;

    if (!token) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    try {
      const payload = jwtService.verify(token);
      req.userId = payload.sub;
      next();
    } catch {
      res.status(401).json({ message: 'Invalid token' });
    }
  };
};
