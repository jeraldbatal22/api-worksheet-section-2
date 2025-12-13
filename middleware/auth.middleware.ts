import type { Request, Response, NextFunction } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { JWT_SECRET } from "../config/env.ts";
// If TypeScript, import from .ts rather than .js (adjust if path differs)
import UserModel from "../model/user.model.ts";

interface AuthRequest extends Request {
  user?: any; // You can make this more specific if User type is available
}

const authorizeMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {

  try {
    let token: string | undefined;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      res.status(401).json({
        message: "Unauthorized",
        statusCode: 401,
        error: true,
      });
      return;
    }

    let decoded: JwtPayload | string;
    try {
      decoded = jwt.verify(token, JWT_SECRET as string);
    } catch (err) {
      res.status(401).json({ error: true, message: "Invalid token" });
      return;
    }

    // Adapt to your actual user model:
    // Assume decoded is { userId: string, ... }
    const userId =
      typeof decoded === "string"
        ? undefined
        : (decoded as { userId?: string; id?: string }).userId ||
          (decoded as { userId?: string; id?: string }).id;

    if (!userId) {
      res.status(401).json({ error: true, message: "Unauthorized" });
      return;
    }

    const user = await UserModel.findById(userId as any);
    if (!user) {
      res.status(401).json({ error: true, message: "Unauthorized" });
      return;
    }

    // Remove password from user object if present
    if ("password" in user) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...userWithoutPassword } = user;
      req.user = userWithoutPassword;
    } else {
      req.user = user;
    }
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware to check if user has required role(s)
 * @param {string[]} allowedRoles - Array of allowed roles (e.g., ['admin'], ['admin', 'doctor'])
 * @returns {Function} Express middleware function
 */
export const authorizeRoles =
  (...allowedRoles: string[]) =>
  (req: AuthRequest, res: Response, next: NextFunction): void => {
    // Check if user is authenticated (req.user should be set by authorizeMiddleware)
    if (!req.user) {
      res.status(401).json({
        message: "Unauthorized - Authentication required",
        statusCode: 401,
        error: true,
      });
      return;
    }

    // Check if user's role is in the allowed roles
    // Adjust according to your user object structure
    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        message: "Forbidden - You do not have permission to access this resource",
        statusCode: 403,
        error: true,
      });
      return;
    }

    next();
  };

export default authorizeMiddleware;
