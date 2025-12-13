import type { Response, NextFunction } from "express";
import UrlShortenerService from "../services/url_shortener.service.ts";
import type { AuthRequest } from "../dto/auth.dto";

class ShortenUrlController {
  // Create a shortened URL
  async create(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const { url, shorten_url } = req.body;

      const result = await UrlShortenerService.shortenUrl(req.user.id, {
        url,
        shorten_url,
      });

      res.status(201).json({ data: result });
    } catch (error) {
      if (error instanceof Error) {
        if (
          error.message === "Both url and shorten_url must be non-empty strings"
        ) {
          res.status(400).json({ error: error.message });
          return;
        }
        if (error.message === "userId must be a positive number") {
          res.status(400).json({ error: error.message });
          return;
        }
      }
      next(error);
    }
  }

  // Get all shortened URLs for the user (paginated)
  async getAll(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = parseInt(req.query.offset as string) || 0;

      const data = await UrlShortenerService.getUrlShortenerByUserId(
        req.user.id,
        {
          limit,
          offset,
        }
      );

      res.json({ data });
    } catch (error) {
      if (error instanceof Error) {
        if (
          error.message === "INVALID_LIMIT" ||
          error.message === "INVALID_OFFSET"
        ) {
          res.status(400).json({ error: "Invalid pagination parameters" });
          return;
        }
        if (error.message === "userId must be a positive number") {
          res.status(400).json({ error: error.message });
          return;
        }
      }
      next(error);
    }
  }

  // Find full/original URL by short code
  async getByShortCode(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { shortCode } = req.params;

      const result = await UrlShortenerService.findByShortCode(shortCode);

      if (!result) {
        res.status(404).json({ error: "Shortened URL not found" });
        return;
      }

      res.json({ data: result });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "shorten_url must be a non-empty string") {
          res.status(400).json({ error: error.message });
          return;
        }
      }
      next(error);
    }
  }
}

export default new ShortenUrlController();
