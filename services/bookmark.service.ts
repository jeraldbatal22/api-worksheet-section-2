import type {
  Bookmark,
  CreateBookmarkDTO,
  UpdateBookmarkDTO,
} from '../model/bookmark.model.ts';
import BookmarkModel from '../model/bookmark.model.ts';

interface BookmarkListOptions {
  limit?: number;
  offset?: number;
}

interface BookmarkListResult {
  bookmarks: Bookmark[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

class BookmarkService {
  // Create a new bookmark for a user
  async createBookmark(userId: number, data: CreateBookmarkDTO): Promise<Bookmark> {
    // Validation: URL is required and must be string
    if (!data.url || typeof data.url !== "string" || data.url.trim().length === 0) {
      throw new Error('URL_REQUIRED');
    }
    // Optionally allow title to be empty, but if provided, must be string
    if (data.title !== undefined && typeof data.title !== "string") {
      throw new Error('TITLE_MUST_BE_STRING');
    }

    // Optionally trim strings
    const bookmarkInput: CreateBookmarkDTO = {
      url: data.url.trim(),
      title: (data.title || "").trim(),
    };

    try {
      return await BookmarkModel.createBookmark(userId, bookmarkInput);
    } catch (e: any) {
      if (e instanceof Error && e.message === "BOOKMARK_ALREADY_EXISTS") {
        throw new Error("BOOKMARK_ALREADY_EXISTS");
      }
      throw e;
    }
  }

  // Get all bookmarks for a user (with pagination)
  async getBookmarks(
    userId: number,
    options: BookmarkListOptions = {}
  ): Promise<BookmarkListResult> {
    const limit = options.limit !== undefined ? options.limit : 50;
    const offset = options.offset !== undefined ? options.offset : 0;

    // Basic validation
    if (limit < 1 || limit > 100) throw new Error('INVALID_LIMIT');
    if (offset < 0) throw new Error('INVALID_OFFSET');

    const bookmarks = await BookmarkModel.readBookmarks(userId, limit, offset);

    // "total" is not available from model, but we can fetch all to get length,
    // but for now, let's count current slice (or optionally add a fast count method).
    // Here, for max compatibility, we'll just pretend we got all for "hasMore".
    const hasMore = bookmarks.length === limit;

    // To generate real total, you would need a count query, not implemented in provided model.
    // So we will return total: offset + bookmarks.length if not enough info.
    // Otherwise in actual use, recommend adding a .countBookmarks(userId) method.

    return {
      bookmarks,
      pagination: {
        // NOTE: Real implementation should return real total.
        // We'll use offset + bookmarks.length + (hasMore ? 1 : 0) as a fake value.
        // For real pagination support, add a count method in model.
        total: offset + bookmarks.length + (hasMore ? 1 : 0),
        limit,
        offset,
        hasMore,
      },
    };
  }

  // Get a single bookmark for a user
  async getBookmarkById(userId: number, bookmarkId: number | string): Promise<Bookmark> {
    // Optionally, do a user check (else just fetch)
    // const user = await UserModel.findById(userId);
    // if (!user) throw new Error('USER_NOT_FOUND');
    const bookmark = await BookmarkModel.readBookmark(bookmarkId, userId);
    if (!bookmark) throw new Error('BOOKMARK_NOT_FOUND');
    return bookmark;
  }

  // Update a bookmark
  async updateBookmark(
    userId: number,
    bookmarkId: number | string,
    updateData: UpdateBookmarkDTO
  ): Promise<Bookmark> {
    // Require at least one field to update
    if (
      updateData.url === undefined &&
      updateData.title === undefined
    ) {
      throw new Error('NO_FIELDS_TO_UPDATE');
    }

    // If updating url
    if (updateData.url !== undefined) {
      if (
        !updateData.url ||
        typeof updateData.url !== "string" ||
        updateData.url.trim().length === 0
      ) {
        throw new Error('URL_REQUIRED');
      }
      updateData.url = updateData.url.trim();
    }

    // If updating title
    if (updateData.title !== undefined) {
      if (typeof updateData.title !== "string") {
        throw new Error('TITLE_MUST_BE_STRING');
      }
      updateData.title = updateData.title.trim();
    }

    try {
      const updated = await BookmarkModel.updateBookmark(bookmarkId, userId, updateData);
      if (!updated) throw new Error('BOOKMARK_NOT_FOUND');
      return updated;
    } catch (e: any) {
      if (e instanceof Error && e.message === "BOOKMARK_ALREADY_EXISTS") {
        throw new Error("BOOKMARK_ALREADY_EXISTS");
      }
      throw e;
    }
  }

  // Delete a bookmark
  async deleteBookmark(userId: number, bookmarkId: number | string): Promise<void> {
    const deleted = await BookmarkModel.deleteBookmark(bookmarkId, userId);
    if (!deleted) throw new Error('BOOKMARK_NOT_FOUND');
  }
}

export default new BookmarkService();