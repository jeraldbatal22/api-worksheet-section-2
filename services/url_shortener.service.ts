import UrlShortenerModel, { type UrlShortener, type CreateShortenUrlDTO } from '../model/url_shortener.model.ts';

interface UrlQueryOptions {
  limit?: number;
  offset?: number;
  userId?: number;
}

class UrlShortenerService {
  // Shorten a given URL
  async shortenUrl(
    userId: number,
    data: CreateShortenUrlDTO
  ): Promise<UrlShortener> {
    if (
      typeof data.url !== "string" ||
      !data.url.trim() ||
      typeof data.shorten_url !== "string" ||
      !data.shorten_url.trim()
    ) {
      throw new Error("Both url and shorten_url must be non-empty strings");
    }
    return await UrlShortenerModel.shortenUrl(userId, data);
  }

  // Find original URL by short code
  async findByShortCode(
    shorten_url: string
  ): Promise<UrlShortener | null> {
    if (typeof shorten_url !== "string" || !shorten_url.trim())
      throw new Error("shorten_url must be a non-empty string");

    return await UrlShortenerModel.findByShortCode(shorten_url);
  }

  // Get all URLs for a user, paginated
  async getUrlShortenerByUserId(userId: number, options: UrlQueryOptions = {}): Promise<UrlShortener[]> {
    const limit = options.limit ?? 10;
    const offset = options.offset ?? 0;
  
    if (limit < 1 || limit > 100) throw new Error("INVALID_LIMIT");
    if (offset < 0) throw new Error("INVALID_OFFSET");
    return await UrlShortenerModel.getUrlShortenerByUserId(
      userId,
      limit,
      offset
    );
  }
}

export default new UrlShortenerService();