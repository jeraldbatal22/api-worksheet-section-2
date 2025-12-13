import type { QueryResult } from 'pg';
import { pgDatabase } from '../database/ps.ts';

// Calculator result interface
export interface Calculator {
  id: number;
  user_id?: number;
  num1: number;
  num2: number;
  operation: '+' | '-' | '*' | '/';
  result: number;
  created_at: string;
  updated_at: string;
}

interface CreateCalculationDTO {
  user_id?: number; // Optional for guest calculations
  num1: number;
  num2: number;
}

class CalculatorModel {
  private tableName = 'calculator';

  // Add
  async add(data: CreateCalculationDTO): Promise<Calculator> {
    const { user_id, num1, num2 } = data;
    const operation = '+';
    const resultValue = num1 + num2;
    const query = `
      INSERT INTO ${this.tableName} (user_id, num1, num2, operation, result, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
      RETURNING *
    `;
    const values = [user_id ?? null, num1, num2, operation, resultValue];
    const result: QueryResult<Calculator> = await pgDatabase.query(query, values);
    return result.rows[0];
  }

  // Subtract
  async subtract(data: CreateCalculationDTO): Promise<Calculator> {
    const { user_id, num1, num2 } = data;
    const operation = '-';
    const resultValue = num1 - num2;
    const query = `
      INSERT INTO ${this.tableName} (user_id, num1, num2, operation, result, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
      RETURNING *
    `;
    const values = [user_id ?? null, num1, num2, operation, resultValue];
    const result: QueryResult<Calculator> = await pgDatabase.query(query, values);
    return result.rows[0];
  }

  // Multiply
  async multiply(data: CreateCalculationDTO): Promise<Calculator> {
    const { user_id, num1, num2 } = data;
    const operation = '*';
    const resultValue = num1 * num2;
    const query = `
      INSERT INTO ${this.tableName} (user_id, num1, num2, operation, result, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
      RETURNING *
    `;
    const values = [user_id ?? null, num1, num2, operation, resultValue];
    const result: QueryResult<Calculator> = await pgDatabase.query(query, values);
    return result.rows[0];
  }

  // Divide
  async divide(data: CreateCalculationDTO): Promise<Calculator> {
    const { user_id, num1, num2 } = data;
    const operation = '/';
    if (num2 === 0) {
      throw new Error('Cannot divide by zero');
    }
    const resultValue = num1 / num2;
    const query = `
      INSERT INTO ${this.tableName} (user_id, num1, num2, operation, result, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
      RETURNING *
    `;
    const values = [user_id ?? null, num1, num2, operation, resultValue];
    const result: QueryResult<Calculator> = await pgDatabase.query(query, values);
    return result.rows[0];
  }

  // Find calculation by ID
  async findById(id: number): Promise<Calculator | null> {
    const query = `
      SELECT * FROM ${this.tableName}
      WHERE id = $1
    `;
    const result: QueryResult<Calculator> = await pgDatabase.query(query, [id]);
    return result.rows[0] || null;
  }

  // Get all calculations (optionally filtered by user)
  async findAllByUserId(userId?: number, limit: number = 10, offset: number = 0): Promise<Calculator[]> {
    let query = `SELECT * FROM ${this.tableName}`;
    const values: any[] = [];

    if (userId !== undefined) {
      query += ` WHERE user_id = $1`;
      values.push(userId);
    }

    query += ` ORDER BY created_at DESC LIMIT $${values.length + 1} OFFSET $${values.length + 2}`;
    values.push(limit, offset);

    const result: QueryResult<Calculator> = await pgDatabase.query(query, values);
    return result.rows;
  }
}

export default new CalculatorModel();