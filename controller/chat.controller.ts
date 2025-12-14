import type { Request, Response, NextFunction } from 'express';
import ChatService from '../services/chat.service.ts';
import type { AuthRequest } from '../dto/auth.dto.ts';
import { createUploader } from '../utils/upload.utils.ts';

class ChatController {
  /**
   * Send a new chat message.
   * Expects body: { content: string, sender_id: number, receiver_id: number, file_url?: string }
   */
  async sendMessage(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      console.log(req.user)
      const upload = createUploader({
        folder: `uploads/chats/${req.user.id}`,
        maxSizeMB: 2,
        allowedTypes: ["image/jpeg", "image/png"],
      }).single("file");

      await new Promise<void>((resolve, reject) => {
        upload(req, res, (err) => {
          if (err) {
            console.log(err, "err")
            reject(err)
          } else resolve();
        });
      });
  
      if (!req.file) {
        return res.status(401).json({ error: 'No files uploaded' });
      }
      const filePath = `${req.file.destination.split("uploads/")[1]}/${req.file.filename}`

      const { content, receiver_id } = req.body;
      const created = await ChatService.sendMessage({ content, sender_id: req.user?.id, receiver_id, file_url: filePath  });
      res.status(201).json({ data: created });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'CONTENT_REQUIRED') {
          res.status(400).json({ error: 'Content is required' });
          return;
        }
        if (error.message === 'INVALID_USER_ID') {
          res.status(400).json({ error: 'Invalid user IDs' });
          return;
        }
      }
      next(error);
    }
  }

  /**
   * Get all chat messages for a user where user is sender or receiver.
   * Expects req.params.userId
   */
  async getMessagesByUserId(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }
      const result = await ChatService.getMessagesByUserId(req.user?.id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get a single message by message id.
   * Expects req.params.messageId
   */
  async getMessageById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const messageId = req.params.id;
  
      const message = await ChatService.getMessageById(messageId);
      res.json({ data: message });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete a message by messageId. Optionally provide userId for extra safety.
   * Expects req.params.messageId and optionally req.body.userId or req.query.userId
   */
  async deleteMessageById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const messageId = req.params.id;
      await ChatService.deleteMessageById(messageId, req?.user?.id);
      res.status(204).send();
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'MESSAGE_NOT_FOUND') {
          res.status(404).json({ error: 'Message not found' });
          return;
        }
      }
      next(error);
    }
  }
}

export default new ChatController();