import type { QueryResult } from 'pg';
import { pgDatabase } from '../database/ps.ts';

// Basic Bookmark interface for TypeScript
export interface Bookmark {
  id: number;
  url: string;
  title: string;
  user_id: number;
  created_at: string;
  updated_at: string;
}

export interface CreateBookmarkDTO {
  url: string;
  title: string;
}

export interface UpdateBookmarkDTO {
  url?: string;
  title?: string;
}

class BookmarkModel {
  private tableName = 'bookmarks';

  // 1. createBookmark() by user id, enforce unique (url, user_id)
  async createBookmark(userId: number, data: CreateBookmarkDTO): Promise<Bookmark> {
    const query = `
      INSERT INTO ${this.tableName} (user_id, url, title, created_at, updated_at)
      VALUES ($1, $2, $3, NOW(), NOW())
      RETURNING *
    `;
    const values = [userId, data.url, data.title];
    const result: QueryResult<Bookmark> = await pgDatabase.query(query, values);
    if (result.rows.length === 0) {
      // If ON CONFLICT DO NOTHING, return null or throw error
      throw new Error('BOOKMARK_ALREADY_EXISTS');
    }
    return result.rows[0];
  }

  // 2. readBookmark(id) by user id
  async readBookmark(id: number | string, userId: number): Promise<Bookmark | null> {
    const query = `
      SELECT * FROM ${this.tableName}
      WHERE id = $1 AND user_id = $2
    `;
    const result: QueryResult<Bookmark> = await pgDatabase.query(query, [id, userId]);
    return result.rows[0] || null;
  }

  // 3. readBookmarks (all for user)
  async readBookmarks(userId: number, limit: number = 50, offset: number = 0): Promise<Bookmark[]> {
    const query = `
      SELECT * FROM ${this.tableName}
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3
    `;
    const result: QueryResult<Bookmark> = await pgDatabase.query(query, [userId, limit, offset]);
    return result.rows;
  }

  // 4. updateBookmark() by user id (can update url and/or title)
  async updateBookmark(id: number | string, userId: number, data: UpdateBookmarkDTO): Promise<Bookmark | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;
    if (data.url !== undefined) {
      fields.push(`url = $${idx++}`);
      values.push(data.url);
    }
    if (data.title !== undefined) {
      fields.push(`title = $${idx++}`);
      values.push(data.title);
    }

    if (fields.length === 0) throw new Error('NO_FIELDS_TO_UPDATE');

    fields.push(`updated_at = NOW()`);
    values.push(id, userId);

    const query = `
      UPDATE ${this.tableName}
      SET ${fields.join(', ')}
      WHERE id = $${idx++} AND user_id = $${idx}
      RETURNING *
    `;
    const result: QueryResult<Bookmark> = await pgDatabase.query(query, values);
    return result.rows[0] || null;
  }

  // 5. deleteBookmark() by user id
  async deleteBookmark(id: number | string, userId: number): Promise<boolean> {
    const query = `
      DELETE FROM ${this.tableName}
      WHERE id = $1 AND user_id = $2
    `;
    const result = await pgDatabase.query(query, [id, userId]);
    return (result.rowCount ?? 0) > 0;
  }
}

export default new BookmarkModel();