// src/models/video-downloader.model.ts

import { pgDatabase } from "../database/ps.ts";

export class CreateVideoDownloadDto {
  url: string;
  user_id: number;

  constructor(url: string, user_id: number) {
    this.url = url;
    this.user_id = user_id;
  }
}

export class UpdateVideoDownloadDto {
  status?: 'pending' | 'downloading' | 'completed' | 'failed';
  file_path?: string;
  file_size?: number;
  error_message?: string;

  constructor(data: Partial<UpdateVideoDownloadDto>) {
    Object.assign(this, data);
  }
}

export class VideoDownloadResponseDto {
  id: number;
  user_id: number;
  url: string;
  file_path?: string;
  file_size?: number;
  created_at: Date;
  updated_at: Date;

  constructor(data: any) {
    this.id = data.id;
    this.user_id = data.user_id;
    this.url = data.url;
    this.file_path = data.file_path;
    this.file_size = data.file_size;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }
}

interface VideoDownload {
  id: number;
  user_id: number;
  url: string;
  file_path?: string;
  file_size?: number;
  error_message?: string;
  created_at: Date;
  updated_at: Date;
}

export class VideoDownloaderModel {
  /**
   * Create a new video download record
   */
  static async create(dto: CreateVideoDownloadDto): Promise<VideoDownload> {
    const text = `
      INSERT INTO video_downloader (user_id, url)
      VALUES ($1, $2)
      RETURNING *;
    `;
    const values = [dto.user_id, dto.url];
    
    const result = await pgDatabase.query(text, values);
    return result.rows[0];
  }

  /**
   * Find video download by ID
   */
  static async findById(id: number): Promise<VideoDownload | null> {
    const text = 'SELECT * FROM video_downloader WHERE id = $1;';
    const result = await pgDatabase.query(text, [id]);
    return result.rows[0] || null;
  }

  /**
   * Find all video downloads by user ID
   */
  static async findByUserId(
    userId: number, 
    limit: number = 10, 
    offset: number = 0
  ): Promise<VideoDownload[]> {
    const text = `
      SELECT * FROM video_downloader 
      WHERE user_id = $1 
      ORDER BY created_at DESC 
      LIMIT $2 OFFSET $3;
    `;
    const result = await pgDatabase.query(text, [userId, limit, offset]);
    return result.rows;
  }

  /**
   * Update video download record
   */
  static async update(
    id: number, 
    dto: UpdateVideoDownloadDto
  ): Promise<VideoDownload | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (dto.file_path !== undefined) {
      fields.push(`file_path = $${paramCount++}`);
      values.push(dto.file_path);
    }
    if (dto.file_size !== undefined) {
      fields.push(`file_size = $${paramCount++}`);
      values.push(dto.file_size);
    }
    if (dto.error_message !== undefined) {
      fields.push(`error_message = $${paramCount++}`);
      values.push(dto.error_message);
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    values.push(id);
    const text = `
      UPDATE video_downloader 
      SET ${fields.join(', ')} 
      WHERE id = $${paramCount}
      RETURNING *;
    `;

    const result = await pgDatabase.query(text, values);
    return result.rows[0] || null;
  }
  
}