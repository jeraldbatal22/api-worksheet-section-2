import type { T_Todo } from "../types/index.ts";

export const todosMock: T_Todo[] = [
  {
    id: "1",
    title: "Buy groceries",
    description: "Milk, Bread, Cheese, Eggs",
    completed: false,
    createdAt: "2024-06-01T10:00:00Z",
  },
  {
    id: "2",
    title: "Finish project report",
    description: "Finalize the healthcare backend documentation",
    completed: false,
    createdAt: "2024-06-01T12:30:00Z",
  },
  {
    id: "3",
    title: "Go for a run",
    description: "Run 5km in the park",
    completed: true,
    createdAt: "2024-06-02T07:00:00Z",
  },
  {
    id: "4",
    title: "Prepare dinner",
    description: "Cook pasta and salad for family",
    completed: false,
    createdAt: "2024-06-02T16:00:00Z",
  },
  {
    id: "5",
    title: "Read a book",
    description: "Read 50 pages of a novel",
    completed: false,
    createdAt: "2024-06-02T20:00:00Z",
  }
];
