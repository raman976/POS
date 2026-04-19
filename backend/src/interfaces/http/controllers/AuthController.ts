import { Request, Response } from 'express';
import { AuthService } from '../../../application/services/AuthService';
import { env } from '../../../config/env';

const getCookieOptions = () => {
  const sameSite = env.nodeEnv === 'production' ? ('none' as const) : ('lax' as const);
  return {
    httpOnly: true,
    sameSite,
    secure: env.nodeEnv === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };
};

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  public register = async (req: Request, res: Response): Promise<void> => {
    try {
      const { user, token } = await this.authService.register(req.body);

      res.cookie('session_token', token, getCookieOptions());
      res.status(201).json({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      });
    } catch (error) {
      const msg = error instanceof Error ? (error.message || error.constructor.name) : String(error)
      console.error('[register]', msg)
      res.status(400).json({ message: msg })
    }
  };

  public login = async (req: Request, res: Response): Promise<void> => {
    try {
      const { user, token } = await this.authService.login(req.body);

      res.cookie('session_token', token, getCookieOptions());
      res.status(200).json({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      });
    } catch (error) {
      const msg = error instanceof Error ? (error.message || error.constructor.name) : String(error)
      console.error('[login]', msg)
      res.status(401).json({ message: msg })
    }
  };

  public me = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      const user = await this.authService.getProfile(req.userId);
      res.status(200).json({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      });
    } catch (error) {
      res.status(404).json({ message: (error as Error).message });
    }
  };

  public logout = (_req: Request, res: Response): void => {
    res.clearCookie('session_token');
    res.status(204).send();
  };

  public verifyPassword = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      const password = String(req.body?.password ?? '');
      const valid = await this.authService.verifyPassword(req.userId, password);
      if (!valid) {
        res.status(401).json({ message: 'Invalid account password' });
        return;
      }

      res.status(200).json({ ok: true });
    } catch (error) {
      const msg = error instanceof Error ? (error.message || error.constructor.name) : String(error);
      res.status(400).json({ message: msg });
    }
  };
}
