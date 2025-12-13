import { Router } from "express";
import { downloadVideo } from "../controller/video-downloader.controller.ts";

const videoDownloaderRouter = Router();

videoDownloaderRouter.post("/", downloadVideo);

export default videoDownloaderRouter;

