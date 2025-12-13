import { Router } from "express";
import todoController from "../controller/todo.controller.ts";

const todoRouter = Router();

todoRouter.get("/", todoController.getAll);
todoRouter.get("/:id", todoController.getById);
todoRouter.post("/", todoController.create);
todoRouter.put("/:id", todoController.update);
todoRouter.delete("/:id", todoController.delete);

export default todoRouter;
