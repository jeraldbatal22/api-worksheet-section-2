import type { QueryResult } from 'pg';
import bcrypt from 'bcrypt';
import type { CreateUserDTO, User } from '../dto/auth.dto.ts';
import { pgDatabase } from '../database/ps.ts';

class UserModel {
  private tableName = 'users';
  private saltRounds = 10;

  // Hash password
  private async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, this.saltRounds);
  }

  // Compare password
  async comparePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  // Create a new user
  async create(userData: CreateUserDTO): Promise<User> {
    const hashedPassword = await this.hashPassword(userData.password);
    
    const query = `
      INSERT INTO ${this.tableName} (username, password, created_at, updated_at)
      VALUES ($1, $2, NOW(), NOW())
      RETURNING *
    `;
    const values = [userData.username, hashedPassword];
    
    const result: QueryResult<User> = await pgDatabase.query(query, values);
    return result.rows[0];
  }

  // Find user by ID (without password)
  async findById(id: number): Promise<Omit<User, 'password'> | null> {
    const query = `
      SELECT id, username, created_at, updated_at 
      FROM ${this.tableName} 
      WHERE id = $1
    `;
    const result: QueryResult<Omit<User, 'password'>> = await pgDatabase.query(query, [id]);
    return result.rows[0] || null;
  }

  // Find user by username (with password for authentication)
  async findByUsernameWithPassword(username: string): Promise<User | null> {
    const query = `SELECT * FROM ${this.tableName} WHERE username = $1`;
    const result: QueryResult<User> = await pgDatabase.query(query, [username]);
    console.log(result.rows)
    return result.rows[0] || null;
  }

  // Find user by username (without password)
  async findByUsername(username: string): Promise<Omit<User, 'password'> | null> {
    const query = `
      SELECT id, username, name, created_at, updated_at 
      FROM ${this.tableName} 
      WHERE username = $1
    `;
    const result: QueryResult<Omit<User, 'password'>> = await pgDatabase.query(query, [username]);
    return result.rows[0] || null;
  }

  // Check if username exists
  async usernameExists(username: string): Promise<boolean> {
    const query = `SELECT EXISTS(SELECT 1 FROM ${this.tableName} WHERE username = $1)`;
    const result = await pgDatabase.query(query, [username]);
    return result.rows[0].exists;
  }

  // Get all users (without passwords)
  async findAll(limit: number = 10, offset: number = 0): Promise<Omit<User, 'password'>[]> {
    const query = `
      SELECT id, username, name, created_at, updated_at 
      FROM ${this.tableName}
      ORDER BY created_at DESC
      LIMIT $1 OFFSET $2
    `;
    const result: QueryResult<Omit<User, 'password'>> = await pgDatabase.query(query, [limit, offset]);
    return result.rows;
  }

  // Update password
  async updatePassword(userId: number, newPassword: string): Promise<void> {
    const hashedPassword = await this.hashPassword(newPassword);
    const query = `
      UPDATE ${this.tableName}
      SET password = $1, updated_at = NOW()
      WHERE id = $2
    `;
    await pgDatabase.query(query, [hashedPassword, userId]);
  }
}

export default new UserModel();