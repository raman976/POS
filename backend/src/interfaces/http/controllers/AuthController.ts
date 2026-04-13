import { Request, Response } from 'express';
import { AuthService } from '../../../application/services/AuthService';

const cookieBase = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: false,
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  public register = async (req: Request, res: Response): Promise<void> => {
    try {
      const { user, token } = await this.authService.register(req.body);

      res.cookie('session_token', token, cookieBase);
      res.status(201).json({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      });
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  };

  public login = async (req: Request, res: Response): Promise<void> => {
    try {
      const { user, token } = await this.authService.login(req.body);

      res.cookie('session_token', token, cookieBase);
      res.status(200).json({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      });
    } catch (error) {
      res.status(401).json({ message: (error as Error).message });
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
}
