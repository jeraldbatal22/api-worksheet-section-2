// ==================== Todo Types ====================
export interface Todo {
  id: number;
  user_id: number;
  title: string;
  description: string | null;
  is_completed: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CreateTodoDTO {
  title: string;
  description?: string;
}

export interface UpdateTodoDTO {
  title?: string;
  description?: string;
  is_completed?: boolean;
}