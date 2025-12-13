import type { QueryResult } from "pg";
import { pgDatabase } from "../database/ps.ts";

// Define message type for TypeScript support
export interface ChatMessage {
  id: number | string;
  content: string;
  sender_id: number | string;
  receiver_id: number | string;
  file_url?: string | null;
  created_at: string;
}

export interface SendMessageDTO {
  content: string;
  sender_id: number | string;
  receiver_id: number | string;
  file_url?: string | null;
}

class ChatModel {
  private tableName = "chats";

  // Send a message (Create)
  async sendMessage(data: SendMessageDTO): Promise<ChatMessage> {
    const query = `
      INSERT INTO ${this.tableName} (content, sender_id, receiver_id, file_url, created_at)
      VALUES ($1, $2, $3, $4, NOW())
      RETURNING *
    `;
    const values = [
      data.content,
      data.sender_id,
      data.receiver_id,
      data.file_url || null,
    ];
    const result: QueryResult<ChatMessage> = await pgDatabase.query(query, values);
    return result.rows[0];
  }

  // Retrieve all messages for a user (as sender or receiver)
  async getMessagesByUserId(userId: number): Promise<ChatMessage[]> {
    const query = `
      SELECT * FROM ${this.tableName}
      WHERE sender_id = $1 OR receiver_id = $1
      ORDER BY created_at DESC
    `;
    const result: QueryResult<ChatMessage> = await pgDatabase.query(query, [userId]);
    return result.rows;
  }

  // Retrieve message by message id
  async getMessageById(messageId: number | string): Promise<ChatMessage | null> {
    console.log(messageId, "messageIdmessageId")
    const query = `
      SELECT * FROM ${this.tableName}
      WHERE id = $1
      LIMIT 1
    `;
    const result: QueryResult<ChatMessage> = await pgDatabase.query(query, [messageId]);
    return result.rows[0] || null;
  }

  // Delete message by message id and (optionally) user
  async deleteMessageById(messageId: number | string | any, userId?: number): Promise<boolean> {
    let query: string;
    let params: Array<number>;
    if (userId !== undefined) {
      // Only allow deletion if user is sender or receiver
      query = `
        DELETE FROM ${this.tableName}
        WHERE id = $1 AND (sender_id = $2 OR receiver_id = $2)
      `;
      params = [messageId, userId];
    } else {
      query = `
        DELETE FROM ${this.tableName}
        WHERE id = $1
      `;
      params = [messageId];
    }
    const result = await pgDatabase.query(query, params);
    return (result.rowCount ?? 0) > 0;
  }
}

export default new ChatModel();