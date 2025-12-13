import type { ChatMessage, SendMessageDTO } from '../model/chat.model.ts';
import ChatModel from '../model/chat.model.ts';

interface ChatListOptions {
  // Could extend for pagination in future
}

interface ChatListResult {
  messages: ChatMessage[];
}

class ChatService {
  /**
   * Send a new chat message.
   * @param data The SendMessageDTO with content, sender_id, receiver_id, file_url (optional)
   */
  async sendMessage(data: SendMessageDTO): Promise<ChatMessage> {
    // Validation
    if (!data.content || typeof data.content !== "string" || data.content.trim().length === 0) {
      throw new Error("CONTENT_REQUIRED");
    }
  
    // Allow file_url to be null
    const trimmedData: SendMessageDTO = {
      content: data.content.trim(),
      sender_id: data.sender_id,
      receiver_id: data.receiver_id,
      file_url: data.file_url?.trim?.() || null,
    };
    return await ChatModel.sendMessage(trimmedData);
  }

  /**
   * Get all chat messages where user is sender or receiver
   * @param userId The user's id
   */
  async getMessagesByUserId(userId: number): Promise<ChatListResult> {
    const messages = await ChatModel.getMessagesByUserId(userId);
    return { messages };
  }

  /**
   * Get a single message by its id
   * @param messageId The id of the message (number)
   */
  async getMessageById(messageId: number | string): Promise<ChatMessage> {
    const message = await ChatModel.getMessageById(messageId);
    if (!message) throw new Error("MESSAGE_NOT_FOUND");
    return message;
  }

  /**
   * Delete a message by id. Optionally require userId (to be either sender or receiver) for safer deletion.
   * @param messageId The id of the message
   * @param userId (optional) If set, only deletes if user is sender/receiver.
   */
  async deleteMessageById(messageId: number | string, userId?: number): Promise<void> {
    // If userId present, require it be a number
    const deleted = await ChatModel.deleteMessageById(messageId, userId);
    if (!deleted) throw new Error("MESSAGE_NOT_FOUND");
  }
}

export default new ChatService();