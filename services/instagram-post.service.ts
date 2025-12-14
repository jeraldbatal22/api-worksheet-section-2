import type {
  InstagramPost,
  CreateInstagramPostDTO,
  UpdateInstagramPostDTO,
  MediaType,
} from '../model/instagram-post.model.ts';
import InstagramPostModel from '../model/instagram-post.model.ts';

class InstagramPostService {
  /**
   * Create a new Instagram post.
   * @param data The CreateInstagramPostDTO with user_id, caption, url, and media_type.
   */
  async createPost(data: CreateInstagramPostDTO): Promise<InstagramPost> {
    if (
      !data.url ||
      typeof data.url !== 'string' ||
      data.url.trim().length === 0
    ) {
      throw new Error('URL_REQUIRED');
    }
    if (
      !data.media_type ||
      (data.media_type !== 'image' && data.media_type !== 'video')
    ) {
      throw new Error('INVALID_MEDIA_TYPE');
    }
    return await InstagramPostModel.createPost({
      ...data,
      caption: data.caption?.trim() || null,
      url: data.url.trim(),
    });
  }

  /**
   * Update an Instagram post by post id and user id.
   * @param postId The id of the post.
   * @param userId The id of the user.
   * @param update The UpdateInstagramPostDTO object.
   */
  async updatePost(
    postId: number | string,
    userId: number | string,
    update: UpdateInstagramPostDTO
  ): Promise<InstagramPost> {
    if (
      !update ||
      (typeof update !== 'object') ||
      (update.caption === undefined &&
        update.url === undefined &&
        update.media_type === undefined)
    ) {
      throw new Error('UPDATE_DATA_REQUIRED');
    }

    // Validate at least one update prop and their types:
    if (update.caption !== undefined && typeof update.caption !== 'string') {
      throw new Error('INVALID_CAPTION');
    }
    if (update.url !== undefined && typeof update.url !== 'string') {
      throw new Error('INVALID_URL');
    }
    if (
      update.media_type !== undefined &&
      update.media_type !== 'image' &&
      update.media_type !== 'video'
    ) {
      throw new Error('INVALID_MEDIA_TYPE');
    }

    const result = await InstagramPostModel.updatePost(postId, userId, update);
    if (!result) throw new Error('POST_NOT_FOUND_OR_NOT_OWNED');
    return result;
  }

  async getPostByIdAndUserId(
    postId: number | string,
    userId: number | string
  ): Promise<InstagramPost | null> {
    if (!postId || !userId) throw new Error('NOT_FOUND');
    const post = await InstagramPostModel.getPostByIdAndUserId(postId, userId);
    if (!post) return null;
    return post;
  }

  /**
   * Get all Instagram posts by a user id.
   * @param userId The user's id.
   */
  async getAllPostsByUserId(userId: number | string): Promise<InstagramPost[]> {
    if (!userId) throw new Error('USER_ID_REQUIRED');
    return await InstagramPostModel.getAllPostsByUserId(userId);
  }

  /**
   * Delete a post by post id and user id.
   * @param postId The id of the post.
   * @param userId The id of the user.
   */
  async deletePostById(
    postId: number | string,
    userId: number | string
  ): Promise<void> {
    const deleted = await InstagramPostModel.deletePostById(postId, userId);
    if (!deleted) throw new Error('POST_NOT_FOUND_OR_NOT_OWNED');
  }
}

export default new InstagramPostService();