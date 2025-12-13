import { Router } from "express";
import {
  createImage,
  getAllImages,
  getImage,
  updateImage,
  deleteImage,
  createVideo,
  getAllVideos,
  getVideo,
  updateVideo,
  deleteVideo,
  uploadImage,
  uploadVideo,
} from "../controller/instagram.controller.ts";

const instagramRouter = Router();

// Image routes
instagramRouter.post("/images", uploadImage.single("file"), createImage);
instagramRouter.get("/images", getAllImages);
instagramRouter.get("/images/:id", getImage);
instagramRouter.put("/images/:id", uploadImage.single("file"), updateImage);
instagramRouter.delete("/images/:id", deleteImage);

// Video routes
instagramRouter.post("/videos", uploadVideo.single("file"), createVideo);
instagramRouter.get("/videos", getAllVideos);
instagramRouter.get("/videos/:id", getVideo);
instagramRouter.put("/videos/:id", uploadVideo.single("file"), updateVideo);
instagramRouter.delete("/videos/:id", deleteVideo);

export default instagramRouter;

