import type { QueryResult } from 'pg';
import type { CreateTodoDTO, Todo, UpdateTodoDTO } from '../dto/todo.dto.ts';
import { pgDatabase } from '../database/ps.ts';

class TodoModel {
  private tableName = 'todos';

  // Create a new todo
  async create(userId: number, todoData: CreateTodoDTO): Promise<Todo> {
    const query = `
      INSERT INTO ${this.tableName} (user_id, title, description, is_completed, created_at, updated_at)
      VALUES ($1, $2, $3, false, NOW(), NOW())
      RETURNING *
    `;
    const values = [userId, todoData.title, todoData.description || null];
    
    const result: QueryResult<Todo> = await pgDatabase.query(query, values);
    return result.rows[0];
  }

  async findByTodoId(id: number): Promise<Todo | null> {
    const query = `
      SELECT * FROM ${this.tableName}
      WHERE id = $1
    `;
    const result: QueryResult<Todo> = await pgDatabase.query(query, [id]);
    return result.rows[0] || null;
  }

  // Find todo by ID and user ID
  async findByIdAndUserId(id: string, userId: number): Promise<Todo | null> {
    console.log(id, userId, "asdasd")
    const query = `
      SELECT * FROM ${this.tableName} 
      WHERE id = $1 AND user_id = $2
    `;
    const result: QueryResult<Todo> = await pgDatabase.query(query, [id, userId]);
    return result.rows[0] || null;
  }

  // Get all todos for a user
  async findAllByUserId(
    userId: number, 
    limit: number = 10, 
    offset: number = 0,
    completed?: boolean
  ): Promise<Todo[]> {
    let query = `
      SELECT * FROM ${this.tableName}
      WHERE user_id = $1
    `;
    const values: any[] = [userId];

    // Filter by completed status if provided
    if (completed !== undefined) {
      query += ` AND completed = $${values.length + 1}`;
      values.push(completed);
    }

    query += ` ORDER BY created_at DESC LIMIT $${values.length + 1} OFFSET $${values.length + 2}`;
    values.push(limit, offset);

    const result: QueryResult<Todo> = await pgDatabase.query(query, values);
    return result.rows;
  }

  // Update todo
  async update(id: string | number, userId: number, todoData: UpdateTodoDTO): Promise<Todo | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (todoData.title !== undefined) {
      fields.push(`title = $${paramCount++}`);
      values.push(todoData.title);
    }
    if (todoData.description !== undefined) {
      fields.push(`description = $${paramCount++}`);
      values.push(todoData.description);
    }
    if (todoData.is_completed !== undefined) {
      fields.push(`is_completed = $${paramCount++}`);
      values.push(todoData.is_completed);
    }

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    fields.push(`updated_at = NOW()`);
    values.push(id, userId);

    const query = `
      UPDATE ${this.tableName}
      SET ${fields.join(', ')}
      WHERE id = $${paramCount++} AND user_id = $${paramCount}
      RETURNING *
    `;

    const result: QueryResult<Todo> = await pgDatabase.query(query, values);
    return result.rows[0] || null;
  }

  // Delete todo
  async delete(id: number | string, userId: number): Promise<boolean> {
    const query = `
      DELETE FROM ${this.tableName} 
      WHERE id = $1 AND user_id = $2
    `;
    const result = await pgDatabase.query(query, [id, userId]);
    return (result.rowCount ?? 0) > 0;
  }

   // Count todos for a user
   async countByUserId(userId: number, completed?: boolean): Promise<number> {
    let query = `SELECT COUNT(*) FROM ${this.tableName} WHERE user_id = $1`;
    const values: any[] = [userId];

    if (completed !== undefined) {
      query += ` AND completed = $2`;
      values.push(completed);
    }

    const result = await pgDatabase.query(query, values);
    return parseInt(result.rows[0].count);
  }
}

export default new TodoModel();