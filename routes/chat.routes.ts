import { Router } from "express";
import chatController from "../controller/chat.controller.ts";
import { uploadSingleFile } from "../utils/upload.utils.ts";

const chatRouter = Router();

// Message routes (file upload is optional when creating a message)
// chatRouter.post("/messages", upload.single("file"), createMessage);
chatRouter.post("/", uploadSingleFile, chatController.sendMessage);
chatRouter.get("/", chatController.getMessagesByUserId);
chatRouter.get("/:id", chatController.getMessageById);
chatRouter.delete("/:id", chatController.deleteMessageById);

export default chatRouter;
