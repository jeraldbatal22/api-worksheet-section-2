import type { Request, Response, NextFunction } from "express";
import InstagramPostService from "../services/instagram-post.service.ts";
import type { AuthRequest } from "../dto/auth.dto.ts";
import { createUploader } from "../utils/upload.utils.ts";
import fs from "fs/promises";
import path from "path";

class InstagramPostController {
  /**
   * Create a new Instagram post.
   * Expects (multipart/form-data) fields:
   *   - caption?: string
   *   - media_type: "image" | "video"
   *   - file: image/video file
   */
  async createPost(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const upload = createUploader({
        folder: `uploads/instagram/post-image/${req.user.id}`,
        maxSizeMB: 20, // Accept larger sizes for videos
        allowedTypes: [
          "image/jpeg",
          "image/png",
          "video/mp4",
          "video/quicktime",
        ],
      }).single("file");

      await new Promise<void>((resolve, reject) => {
        upload(req, res, (err) => {
          if (err) return reject(err);
          resolve();
        });
      });
      console.log(req.file);
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }
      const mediaType = req.file.mimetype.split("/")[0] || null;
      const filePath = `instagram/post-${req.file.mimetype.split("/")[0]}/${
        req.user.id
      }/${req.file.filename}`;
      console.log(filePath, "filePath");
      const { caption } = req.body;

      const created = await InstagramPostService.createPost({
        user_id: req.user.id,
        caption,
        url: filePath,
        media_type: mediaType as any,
      });
      res.status(201).json({ data: created });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "URL_REQUIRED") {
          res.status(400).json({ error: "URL is required" });
          return;
        }
        if (error.message === "INVALID_MEDIA_TYPE") {
          res.status(400).json({ error: "Invalid media type" });
          return;
        }
      }
      next(error);
    }
  }

  /**
   * Update an Instagram post.
   * Expects req.params.id (post id), and body: { caption?, url?, media_type? }
   * Only updates post owned by current user.
   */
  /**
   * Update an Instagram post.
   * Expects req.params.id (post id), and optionally a new file upload (req.file) and/or caption in body.
   * If a new file is uploaded, deletes the old file from disk before updating to the new one (mirroring logic in @file_context_0).
   * Only updates post owned by current user.
   */
  async updatePost(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const upload = createUploader({
        folder: `uploads/instagram/post-image/${req.user.id}`,
        maxSizeMB: 20,
        allowedTypes: [
          "image/jpeg",
          "image/png",
          "video/mp4",
          "video/quicktime",
        ],
      }).single("file");

      await new Promise<void>((resolve, reject) => {
        upload(req, res, (err) => {
          if (err) return reject(err);
          resolve();
        });
      });

      const postId = req.params.id;
      let filePath: string | undefined = undefined;
      let mediaType: string | null = null;

      // Allow updating caption and/or media file
      const { caption } = req.body;

      // Retrieve existing post (so we know where the old file is)
      const existingPost = await InstagramPostService.getPostByIdAndUserId(
        postId,
        req.user.id
      );

      if (!existingPost) {
        return res
          .status(404)
          .json({ error: "Post not found or not owned by user" });
      }

      // If a new file is uploaded, delete the old file before updating URL/media_type
      if (req.file) {
        mediaType = req.file.mimetype.split("/")[0] || null;
        filePath = `instagram/post-${mediaType}/${req.user.id}/${req.file.filename}`;

        // Only delete the old file if there was one
        if (existingPost.url) {
          const oldFilePath = path.join(
            process.cwd(),
            "uploads",
            existingPost.url.replace(/^instagram\//, "")
          );
          try {
            await fs.unlink(oldFilePath);
          } catch (error) {
            // Log but do not fail update if file does not exist
            console.warn(
              `Old post media file not found on disk: ${oldFilePath}`
            );
          }
        }
      }

      // Build the update payload: allow changing file or caption
      const updatePayload: any = {};
      if (typeof caption !== "undefined") updatePayload.caption = caption;
      if (typeof filePath !== "undefined") updatePayload.url = filePath;
      if (typeof mediaType !== "undefined" && mediaType !== null)
        updatePayload.media_type = mediaType;

      // If nothing to update, error (like @file_context_0 expects at least something)
      if (Object.keys(updatePayload).length === 0) {
        return res.status(400).json({ error: "No update data provided" });
      }

      const updated = await InstagramPostService.updatePost(
        postId,
        req.user.id,
        updatePayload
      );

      res.json({ data: updated });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "UPDATE_DATA_REQUIRED") {
          res.status(400).json({ error: "No update data provided" });
          return;
        }
        if (error.message === "INVALID_CAPTION") {
          res.status(400).json({ error: "Invalid caption" });
          return;
        }
        if (error.message === "INVALID_URL") {
          res.status(400).json({ error: "Invalid URL" });
          return;
        }
        if (error.message === "INVALID_MEDIA_TYPE") {
          res.status(400).json({ error: "Invalid media type" });
          return;
        }
        if (
          error.message === "POST_NOT_FOUND_OR_NOT_OWNED" ||
          error.message === "NOT_FOUND"
        ) {
          res
            .status(404)
            .json({ error: "Post not found or not owned by user" });
          return;
        }
      }
      next(error);
    }
  }

  /**
   * Get all Instagram posts for the authenticated user.
   */
  async getAllPostsByUserId(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      if (!req.user) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }
      const posts = await InstagramPostService.getAllPostsByUserId(req.user.id);
      res.json({ data: posts });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "USER_ID_REQUIRED") {
          res.status(400).json({ error: "User id is required" });
          return;
        }
      }
      next(error);
    }
  }

  /**
   * Delete an Instagram post by id. Only allows deleting own posts.
   * Expects req.params.id
   */
  async deletePostById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }
      const postId = req.params.id;

      // Find the post first to get URL and media type
      const post = await InstagramPostService.getPostByIdAndUserId(
        postId,
        req.user.id
      );
      if (!post) {
        res.status(404).json({ error: "Post not found or not owned by user" });
        return;
      }

      await fs.unlink(`uploads/${post.url}`);
      await InstagramPostService.deletePostById(postId, req.user.id);
      res.status(204).send();
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === "POST_NOT_FOUND_OR_NOT_OWNED"
      ) {
        res.status(404).json({ error: "Post not found or not owned by user" });
        return;
      }
      next(error);
    }
  }
}

export default new InstagramPostController();
