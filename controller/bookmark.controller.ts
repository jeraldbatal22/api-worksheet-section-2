import type { Response, NextFunction } from 'express';
import BookmarkService from '../services/bookmark.service.ts';
import type { AuthRequest } from '../dto/auth.dto';

class BookmarkController {
  async create(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { url, title } = req.body;
      const bookmark = await BookmarkService.createBookmark(req.user.id, { url, title });

      res.status(201).json({ data: bookmark });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'URL_REQUIRED') {
          res.status(400).json({ error: 'URL is required' });
          return;
        }
        if (error.message === 'TITLE_MUST_BE_STRING') {
          res.status(400).json({ error: 'Title must be a string' });
          return;
        }
        if (error.message === 'BOOKMARK_ALREADY_EXISTS') {
          res.status(409).json({ error: 'Bookmark already exists' });
          return;
        }
      }
      next(error);
    }
  }

  async getAll(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
      const offset = req.query.offset ? parseInt(req.query.offset as string, 10) : 0;

      const result = await BookmarkService.getBookmarks(req.user.id, {
        limit,
        offset,
      });

      res.json(result);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'INVALID_LIMIT' || error.message === 'INVALID_OFFSET') {
          res.status(400).json({ error: 'Invalid pagination parameters' });
          return;
        }
      }
      next(error);
    }
  }

  async getById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const id = req.params.id;

      const bookmark = await BookmarkService.getBookmarkById(req.user.id, id);

      res.json({ data: bookmark });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'BOOKMARK_NOT_FOUND') {
          res.status(404).json({ error: 'Bookmark not found' });
          return;
        }
      }
      next(error);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const id = req.params.id;
      const { url, title } = req.body;

      const bookmark = await BookmarkService.updateBookmark(req.user.id, id, {
        url,
        title,
      });

      res.json({ data: bookmark });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'BOOKMARK_NOT_FOUND') {
          res.status(404).json({ error: 'Bookmark not found' });
          return;
        }
        if (error.message === 'NO_FIELDS_TO_UPDATE') {
          res.status(400).json({ error: 'At least one field must be provided' });
          return;
        }
        if (error.message === 'URL_REQUIRED') {
          res.status(400).json({ error: 'URL is required' });
          return;
        }
        if (error.message === 'TITLE_MUST_BE_STRING') {
          res.status(400).json({ error: 'Title must be a string' });
          return;
        }
        if (error.message === 'BOOKMARK_ALREADY_EXISTS') {
          res.status(409).json({ error: 'Bookmark already exists' });
          return;
        }
      }
      next(error);
    }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const id = req.params.id;
      await BookmarkService.deleteBookmark(req.user.id, id);

      res.status(204).send();
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'BOOKMARK_NOT_FOUND') {
          res.status(404).json({ error: 'Bookmark not found' });
          return;
        }
      }
      next(error);
    }
  }
}

export default new BookmarkController();