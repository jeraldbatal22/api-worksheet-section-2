import type { QueryResult } from "pg";
import { pgDatabase } from "../database/ps.ts";

// Enum for supported media types
export type MediaType = "image" | "video" | null;

// Interface for an Instagram post
export interface InstagramPost {
  id: number | string;
  user_id: number | string;
  caption?: string | null;
  url: string;
  media_type: MediaType;
  created_at: string;
  updated_at: string;
}

// DTO for creating an Instagram post
export interface CreateInstagramPostDTO {
  user_id: number | string;
  caption?: string | null;
  url: string;
  media_type: MediaType;
}

// DTO for updating an Instagram post
export interface UpdateInstagramPostDTO {
  caption?: string | null;
  url?: string;
  media_type?: MediaType;
}

class InstagramPostModel {
  private tableName = "instagram_posts";

  // Create a new Instagram post
  async createPost(data: CreateInstagramPostDTO): Promise<InstagramPost> {
    const query = `
      INSERT INTO ${this.tableName} (user_id, caption, url, media_type, created_at, updated_at)
      VALUES ($1, $2, $3, $4, NOW(), NOW())
      RETURNING *
    `;
    const values = [
      data.user_id,
      data.caption,
      data.url,
      data.media_type
    ];
    const result: QueryResult<InstagramPost> = await pgDatabase.query(query, values);
    return result.rows[0];
  }

  // Update an Instagram post by post id and user id
  async updatePost(postId: number | string, userId: number | string, data: UpdateInstagramPostDTO): Promise<InstagramPost | null> {
    // Build update fields and values dynamically
    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (data.caption !== undefined) {
      fields.push(`caption = $${idx++}`);
      values.push(data.caption);
    }
    if (data.url !== undefined) {
      fields.push(`url = $${idx++}`);
      values.push(data.url);
    }
    if (data.media_type !== undefined) {
      fields.push(`media_type = $${idx++}`);
      values.push(data.media_type);
    }

    if (fields.length === 0) return null;

    fields.push(`updated_at = NOW()`);
    const setClause = fields.join(", ");
    // Add postId and userId to values for WHERE clause
    values.push(postId);
    values.push(userId);

    const query = `
      UPDATE ${this.tableName}
      SET ${setClause}
      WHERE id = $${values.length - 1} AND user_id = $${values.length}
      RETURNING *
    `;
    const result: QueryResult<InstagramPost> = await pgDatabase.query(query, values);
    return result.rows[0] || null;
  }

  async getPostByIdAndUserId(postId: number | string, userId: number | string): Promise<InstagramPost | null> {
    const query = `
      SELECT * FROM ${this.tableName}
      WHERE id = $1 AND user_id = $2
      LIMIT 1
    `;
    const result: QueryResult<InstagramPost> = await pgDatabase.query(query, [postId, userId]);
    return result.rows[0] || null;
  }

  // Get all posts by a user id
  async getAllPostsByUserId(userId: number | string): Promise<InstagramPost[]> {
    const query = `
      SELECT * FROM ${this.tableName}
      WHERE user_id = $1
      ORDER BY created_at DESC
    `;
    const result: QueryResult<InstagramPost> = await pgDatabase.query(query, [userId]);
    return result.rows;
  }

  // Delete a post by post id and user id
  async deletePostById(postId: number | string, userId: number | string): Promise<boolean> {
    const query = `
      DELETE FROM ${this.tableName}
      WHERE id = $1 AND user_id = $2
    `;
    const result = await pgDatabase.query(query, [postId, userId]);
    return (result.rowCount ?? 0) > 0;
  }
}

export default new InstagramPostModel();