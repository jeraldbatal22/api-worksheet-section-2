// src/routes/video-downloader.routes.ts
import { Router } from 'express';
import { body } from 'express-validator';
import { VideoDownloaderController } from '../controller/video-downloader.controller.ts';

const videoDownloaderRouter = Router();
const videoController = new VideoDownloaderController();

/**
 * @route   POST /api/videos/download
 * @desc    Create new video download request
 */
videoDownloaderRouter.post(
  '/download',
  [
    body('url')
      .notEmpty()
      .withMessage('URL is required')
      .isURL()
      .withMessage('Must be a valid URL'),
  ],
  videoController.createVideoDownload
);


/**
 * @route   GET /api/videos/user/:userId
 * @desc    Get all video downloads for a user
 */
videoDownloaderRouter.get(
  '/',
  videoController.getUserVideoDownloads
);

export default videoDownloaderRouter;

// import { Router } from "express";
// import { downloadVideo } from "../controller/video-downloader.controller.ts";

// const videoDownloaderRouter = Router();

// videoDownloaderRouter.post("/", downloadVideo);

// export default videoDownloaderRouter;

