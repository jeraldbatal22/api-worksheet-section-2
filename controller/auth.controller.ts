import type { Request, Response, NextFunction } from 'express';
import AuthService from '../services/auth.service.ts';

class AuthController {
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { username, password } = req.body;
      
      const result = await AuthService.register({ username, password });
      
      res.status(201).json(result);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'EMAIL_ALREADY_EXISTS') {
          res.status(409).json({ error: 'Email already registered' });
          return;
        }
      }
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { username, password } = req.body;
      
      const result = await AuthService.login({ username, password });
        console.log(result, "result")
      res.json(result);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'INVALID_CREDENTIALS') {
          res.status(401).json({ error:true, message: 'Invalid credentials' });
          return;
        }
      }
      next(error);
    }
  }
}

export default new AuthController();