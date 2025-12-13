import { Router } from "express";
import bookmarkController from "../controller/bookmark.controller.ts";

const bookmarkRouter = Router();

bookmarkRouter.get("/", bookmarkController.getAll);
bookmarkRouter.get("/:id", bookmarkController.getById);
bookmarkRouter.post("/", bookmarkController.create);
bookmarkRouter.put("/:id", bookmarkController.update);
bookmarkRouter.delete("/:id", bookmarkController.delete);

export default bookmarkRouter;
