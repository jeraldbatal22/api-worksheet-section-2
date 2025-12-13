import type {
  AuthResponse,
  CreateUserDTO,
  JwtPayload,
  LoginDTO,
} from "../dto/auth.dto.ts";
import UserModel from "../model/user.model.ts";
import { generateAccessToken, verifyAccessToken } from "../utils/index.ts";

class AuthService {
  // // Register new user
  async register(userData: CreateUserDTO): Promise<AuthResponse> {
    // Check if email already exists
    const usernameExists = await UserModel.usernameExists(userData.username);
    if (usernameExists) {
      throw new Error("EMAIL_ALREADY_EXISTS");
    }

    // Create user
    const user = await UserModel.create(userData);

    const token = generateAccessToken({
      userId: user.id,
      username: user.username,
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      token,
    };
  }

  // Login user
  async login(loginData: LoginDTO): Promise<AuthResponse> {
    // Find user by email
    const user = await UserModel.findByUsernameWithPassword(loginData.username);
    console.log(user, "user")
    if (!user) {
      throw new Error("INVALID_CREDENTIALS");
    }

    // Verify password
    const isPasswordValid = await UserModel.comparePassword(
      loginData.password,
      user.password
    );
    if (!isPasswordValid) {
      throw new Error("INVALID_CREDENTIALS");
    }

    // Generate JWT token
    const token = generateAccessToken({
      userId: user.id,
      username: user.username,
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      token,
    };
  }

}

export default new AuthService();
