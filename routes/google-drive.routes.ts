import { Router } from "express";
import { uploadFile } from "../controller/google-drive.controller.ts";

const googleDriveRouter = Router();

googleDriveRouter.post("/upload", uploadFile);

export default googleDriveRouter;

