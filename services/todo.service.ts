import type { CreateTodoDTO, Todo, UpdateTodoDTO } from '../dto/todo.dto.ts';
import TodoModel from '../model/todo.model.ts';
import UserModel from '../model/user.model.ts';

interface TodoListOptions {
  limit?: number;
  offset?: number;
  completed?: boolean;
}

interface TodoListResult {
  todos: Todo[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

interface TodoStats {
  total: number;
  completed: number;
  pending: number;
  completionRate: string;
}

class TodoService {
  // Create new todo
  async createTodo(userId: number, todoData: CreateTodoDTO): Promise<Todo> {
    // Validate title
    if (!todoData.title || todoData.title.trim().length === 0) {
      throw new Error('TITLE_REQUIRED');
    }

    if (todoData.title.length > 200) {
      throw new Error('TITLE_TOO_LONG');
    }

    // Business logic: Auto-trim title and description
    const sanitizedData: CreateTodoDTO = {
      title: todoData.title.trim(),
      description: todoData.description?.trim(),
    };

    return await TodoModel.create(userId, sanitizedData);
  }

  // Get all todos for user
  async getTodos(userId: number, options: TodoListOptions = {}): Promise<TodoListResult> {
    const limit = options.limit || 10;
    const offset = options.offset || 0;

    // Validate pagination parameters
    if (limit < 1 || limit > 100) {
      throw new Error('INVALID_LIMIT');
    }
    if (offset < 0) {
      throw new Error('INVALID_OFFSET');
    }

    const todos = await TodoModel.findAllByUserId(
      userId,
      limit,
      offset,
      options.completed
    );

    const total = await TodoModel.countByUserId(userId, options.completed);

    return {
      todos,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    };
  }

  // Get single todo
  async getTodoById(userId: number, todoId: string): Promise<Todo> {
    const user = await UserModel.findById(userId);
    console.log(todoId, "todoId")
    if (!user) {
      throw new Error('USER_NOT_FOUND');
    }

    const todo = await TodoModel.findByIdAndUserId(todoId, userId);
    
    if (!todo) {
      throw new Error('TODO_NOT_FOUND');
    }

    return todo;
  }

  // Update todo
  async updateTodo(
    userId: number,
    todoId: string | number,
    updateData: UpdateTodoDTO
  ): Promise<Todo> {
    // Validate at least one field is provided
    if (
      updateData.title === undefined &&
      updateData.description === undefined &&
      updateData.is_completed === undefined
    ) {
      throw new Error('NO_FIELDS_TO_UPDATE');
    }

    // Validate title if provided
    if (updateData.title !== undefined) {
      if (updateData.title.trim().length === 0) {
        throw new Error('TITLE_REQUIRED');
      }
      if (updateData.title.length > 200) {
        throw new Error('TITLE_TOO_LONG');
      }
      // Auto-trim title
      updateData.title = updateData.title.trim();
    }

    // Auto-trim description if provided
    if (updateData.description !== undefined) {
      updateData.description = updateData.description.trim();
    }

    const todo = await TodoModel.update(todoId, userId, updateData);

    if (!todo) {
      throw new Error('TODO_NOT_FOUND');
    }

    return todo;
  }

  // Delete todo
  async deleteTodo(userId: number, todoId: number | string): Promise<void> {
    const deleted = await TodoModel.delete(todoId, userId);

    if (!deleted) {
      throw new Error('TODO_NOT_FOUND');
    }
  }

}

export default new TodoService();