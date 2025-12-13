import type { Request } from 'express';

export interface User {
  id: number;
  username: string;
  password: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateUserDTO {
  username: string;
  password: string;
}

export interface LoginDTO {
  username: string;
  password: string;
}

export interface AuthResponse {
  user: Omit<User, 'password'>;
  token: string;
}

export interface JwtPayload {
  id: number;
  username: string;
}

export interface AuthRequest extends Request {
  user?: JwtPayload;
}