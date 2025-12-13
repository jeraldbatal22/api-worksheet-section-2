import type { Response, NextFunction } from 'express';
import TodoService from '../services/todo.service.ts';
import type { AuthRequest } from '../dto/auth.dto';

class TodoController {
  async create(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { title, description } = req.body;
      const todo = await TodoService.createTodo(req.user.id, { title, description });

      res.status(201).json({ data: todo });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'TITLE_REQUIRED') {
          res.status(400).json({ error: 'Title is required' });
          return;
        }
        if (error.message === 'TITLE_TOO_LONG') {
          res.status(400).json({ error: 'Title must be less than 200 characters' });
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

      const limit = parseInt(req.query.limit as string) || 10;
      const offset = parseInt(req.query.offset as string) || 0;
      const completed = req.query.completed === 'true' ? true : 
                       req.query.completed === 'false' ? false : undefined;

      const result = await TodoService.getTodos(req.user.id, {
        limit,
        offset,
        completed,
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

      const todo = await TodoService.getTodoById(req.user.id, id);

      res.json({ data: todo });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'TODO_NOT_FOUND') {
          res.status(404).json({ error: 'Todo not found' });
          return;
        } 
        if (error.message === 'USER_NOT_FOUND') {
          res.status(404).json({ error: 'User not found' });
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
      const { title, description, is_completed } = req.body;

      const todo = await TodoService.updateTodo(req.user.id, id, {
        title,
        description,
        is_completed,
      });

      res.json({ data: todo });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'TODO_NOT_FOUND') {
          res.status(404).json({ error: 'Todo not found' });
          return;
        }
        if (error.message === 'NO_FIELDS_TO_UPDATE') {
          res.status(400).json({ error: 'At least one field must be provided' });
          return;
        }
        if (error.message === 'TITLE_REQUIRED') {
          res.status(400).json({ error: 'Title is required' });
          return;
        }
        if (error.message === 'TITLE_TOO_LONG') {
          res.status(400).json({ error: 'Title must be less than 200 characters' });
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
      await TodoService.deleteTodo(req.user.id, id);

      res.status(204).send();
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'TODO_NOT_FOUND') {
          res.status(404).json({ error: 'Todo not found' });
          return;
        }
      }
      next(error);
    }
  }


}

export default new TodoController();