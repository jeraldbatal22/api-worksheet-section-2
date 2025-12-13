import jwt, { JwtPayload } from "jsonwebtoken";
import { JWT_REFRESH_EXPIRES_IN } from "../config/env";
import type { StringValue } from "ms";

const JWT_SECRET =
  process.env.JWT_SECRET || "your-secret-key-change-in-production";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

class JwtUtils {
  generateAccessToken = (payload: string | object | Buffer) => {
    // Fallback to a sane default to avoid passing undefined to jwt.sign
    const expiresIn: StringValue | number =
      (JWT_EXPIRES_IN as StringValue | number) || "15m";

    const options = { expiresIn };

    return jwt.sign(payload, JWT_SECRET || "secret", options) as any;
  };

  generateRefreshToken = (payload: string | object | Buffer) => {
    const expiresIn: StringValue | number =
      (JWT_REFRESH_EXPIRES_IN as StringValue | number) || "7d";

    const options = { expiresIn };

    return jwt.sign(payload, JWT_SECRET || "secret", options) as any;
  };

  verifyAccessToken = (token: string) => {
    return jwt.verify(token, JWT_SECRET! || "secret") as any;
  };

  verifyRefreshToken = (token: string) => {
    return jwt.verify(token, JWT_SECRET! || "secret") as any;
  };
}

export default new JwtUtils();
