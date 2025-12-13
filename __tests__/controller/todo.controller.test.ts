import {
  getTodos,
  getTodo,
  addTodo,
  updateTodo,
  deleteTodo,
  resetTodosMock,
  getTodosState,
} from "../../controller/todo.controller";
import type { Request, Response } from "express";

const buildRes = () => {
  const res: Partial<Response> = {
    status: jest.fn().mockReturnThis(),
    send: jest.fn(),
  };
  return res as Response;
};

describe("todo.controller", () => {
  beforeEach(() => {
    resetTodosMock();
  });

  it("gets all todos", async () => {
    const req = {} as Partial<Request>;
    const res = buildRes();
    // @ts-ignore
    await getTodos(req as Request, res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.arrayContaining([]) })
    );
  });

  it("gets single todo and fails on missing id", async () => {
    const req = { params: { id: "1" } } as Partial<Request>;
    const res = buildRes();
    // @ts-ignore
    await getTodo(req as Request, res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ id: "1" }) })
    );

    const missingReq = { params: { id: "999" } } as Partial<Request>;
    const next = jest.fn();
    // @ts-ignore
    await getTodo(missingReq as Request, res, next);
    expect(next).toHaveBeenCalled();
  });

  // it("adds todos and increases array length", async () => {
  //   const initial = resetTodosMock();
  //   const reqs: Partial<Request>[] = [
  //     { body: { title: "New 1", description: "Desc1", completed: false } },
  //     { body: { title: "New 2", description: "Desc2", completed: true } },
  //     { body: { title: "New 3", description: "Desc3", completed: false } },
  //   ];

  //   for (const req of reqs) {
  //     const res = buildRes();
  //     // @ts-ignore
  //     await addTodo(req as Request, res, jest.fn());
  //     expect(res.status).toHaveBeenCalledWith(201);
  //     expect(res.send).toHaveBeenCalledWith(
  //       expect.objectContaining({
  //         success: true,
  //         message: "Successfully Added Todo",
  //       })
  //     );
  //   }

  //   const finalState = getTodosState();
  //   expect(finalState.length).toBe(initial.length + reqs.length);
  // });

  it("updates todo and fails when id not found", async () => {
    const req = {
      params: { id: "1" },
      body: { title: "Updated", description: "Updated", completed: true },
    } as Partial<Request>;
    const res = buildRes();
    // @ts-ignore
    await updateTodo(req as Request, res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Successfully Updated Todo" })
    );

    const missing = {
      params: { id: "999" },
      body: { title: "Updated", description: "Updated", completed: true },
    } as Partial<Request>;
    const next = jest.fn();
    // @ts-ignore
    await updateTodo(missing as Request, res, next);
    expect(next).toHaveBeenCalled();
  });

  it("deletes todo and fails on missing id", async () => {
    const req = { params: { id: "1" } } as Partial<Request>;
    const res = buildRes();
    // @ts-ignore
    await deleteTodo(req as Request, res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Successfully Deleted Todo" })
    );

    const missing = { params: { id: "999" } } as Partial<Request>;
    const next = jest.fn();
    // @ts-ignore
    await deleteTodo(missing as Request, res, next);
    expect(next).toHaveBeenCalled();
  });
});

