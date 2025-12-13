import { Router } from 'express';
import authController from '../controller/auth.controller.ts';

const authRouter = Router();

authRouter.post('/login', authController.login);
authRouter.post('/register', authController.register);

export default authRouter;