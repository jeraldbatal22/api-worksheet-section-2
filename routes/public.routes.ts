import { Router } from "express";
import PublicController from "../controller/public.controller.ts";

const publicRouter = Router();

publicRouter.get("/files", PublicController.getFile);

export default publicRouter;
