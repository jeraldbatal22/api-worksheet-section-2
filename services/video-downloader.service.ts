// src/services/video-downloader.service.ts
import fs from 'fs';
import path from 'path';
import { CreateVideoDownloadDto, UpdateVideoDownloadDto, VideoDownloaderModel, VideoDownloadResponseDto } from '../model/video-downloader.model.ts';
import axios from 'axios';

export class VideoDownloaderService {
  private uploadDir: string;

  constructor() {
    this.uploadDir = process.env.UPLOAD_DIR || './uploads/video-downloader';
    this.ensureUploadDirectoryExists();
  }

  /**
   * Ensure upload directory exists
   */
  private ensureUploadDirectoryExists(): void {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  /**
   * Validate video URL
   */
  private isValidUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);
      return ['http:', 'https:'].includes(urlObj.protocol);
    } catch {
      return false;
    }
  }

  /**
   * Generate unique filename
   */
  private generateFilename(url: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    const extension = path.extname(new URL(url).pathname) || '.mp4';
    return `video_${timestamp}_${random}${extension}`;
  }

  /**
   * Create new video download request
   */
  async createVideoDownload(dto: CreateVideoDownloadDto): Promise<VideoDownloadResponseDto> {
    // Validate URL
    if (!this.isValidUrl(dto.url)) {
      throw new Error('Invalid video URL provided');
    }

    // Create database record
    const videoDownload = await VideoDownloaderModel.create(dto);

    // Start download process asynchronously (non-blocking)
    this.downloadVideo(videoDownload.id, dto.url, dto.user_id).catch((error) => {
      console.error(`Download failed for video ${videoDownload.id}:`, error.message);
    });

    return new VideoDownloadResponseDto(videoDownload);
  }

  /**
   * Download video from URL
   */
  private async downloadVideo(id: number, url: string, user_id: string | number): Promise<void> {
    let filePath: string | null = null;

    try {
      // Update status to downloading
      await VideoDownloaderModel.update(id, new UpdateVideoDownloadDto({ status: 'downloading' }));

      const filename = this.generateFilename(url);
      filePath = path.join(this.uploadDir, user_id as string, filename);

      // Ensure user-specific directory exists
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
      // Download video
      const response = await axios({
        method: 'GET',
        url: url,
        responseType: 'stream',
        timeout: 300000, // 5 minutes timeout
        maxContentLength: 500 * 1024 * 1024, // 500MB max
      });

      const writer = fs.createWriteStream(filePath);
      response.data.pipe(writer);

      await new Promise<void>((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
      });

      // Get file size
      const stats = fs.statSync(filePath);
      const fileSize = stats.size;

      // Update status to completed
      await VideoDownloaderModel.update(
        id,
        new UpdateVideoDownloadDto({
          status: 'completed',
          file_path: filePath,
          file_size: fileSize,
        })
      );

      console.log(`✅ Video ${id} downloaded successfully`);
    } catch (error: any) {
      // Clean up file if it exists
      if (filePath && fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      // Update status to failed
      await VideoDownloaderModel.update(
        id,
        new UpdateVideoDownloadDto({
          status: 'failed',
          error_message: error.message || 'Download failed',
        })
      );

      console.error(`❌ Video ${id} download failed:`, error.message);
      throw error;
    }
  }

  /**
   * Get all video downloads for a user
   */
  async getUserVideoDownloads(
    userId: number,
    page: number = 1,
    limit: number = 10
  ): Promise<{ data: VideoDownloadResponseDto[] }> {
    const offset = (page - 1) * limit;
    const [videos] = await Promise.all([
      VideoDownloaderModel.findByUserId(userId, limit, offset),
    ]);

    return {
      data: videos.map((v) => new VideoDownloadResponseDto(v)),
    };
  }
}