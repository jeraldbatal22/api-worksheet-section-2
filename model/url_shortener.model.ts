import type { QueryResult } from 'pg';
import { pgDatabase } from '../database/ps.ts';

export interface UrlShortener {
  id: number;
  user_id: number;
  url: string;
  shorten_url: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateShortenUrlDTO {
  url: string;
  shorten_url: string;
}

class UrlShortenerModel {
  private tableName = 'url_shortener';

  // Create a shortened URL (shortenUrl)
  async shortenUrl(userId: number, data: CreateShortenUrlDTO): Promise<UrlShortener> {
    const query = `
      INSERT INTO ${this.tableName} (user_id, url, shorten_url, created_at, updated_at)
      VALUES ($1, $2, $3, NOW(), NOW())
      RETURNING *
    `;
    const values = [userId, data.url, data.shorten_url];
    const result: QueryResult<UrlShortener> = await pgDatabase.query(query, values);
    return result.rows[0];
  }

  // Get all shortened urls by userId (getUrlShortenerByUserId)
  async getUrlShortenerByUserId(
    userId: number,
    limit: number = 10,
    offset: number = 0
  ): Promise<UrlShortener[]> {
    const query = `
      SELECT * FROM ${this.tableName}
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3
    `;
    const values = [userId, limit, offset];
    const result: QueryResult<UrlShortener> = await pgDatabase.query(query, values);
    return result.rows;
  }

  // Optionally: Find by short code
  async findByShortCode(shorten_url: string): Promise<UrlShortener | null> {
    const query = `
      SELECT * FROM ${this.tableName}
      WHERE shorten_url = $1
      LIMIT 1
    `;
    const values = [shorten_url];
    const result: QueryResult<UrlShortener> = await pgDatabase.query(query, values);
    return result.rows[0] || null;
  }
}

export default new UrlShortenerModel();