import { Router } from "express";
import instagramPostController from "../controller/instagram-post.controller.ts";

// Use a router for "Instagram posts" endpoints (handling both images and videos in a generic way)
const instagramPostRouter = Router();

// Create a new Instagram post (image or video upload)
instagramPostRouter.post("/", (req, res, next) =>
  instagramPostController.createPost(req, res, next)
);

// Update an Instagram post by id
instagramPostRouter.put("/:id", (req, res, next) =>
  instagramPostController.updatePost(req, res, next)
);

// Get all posts for the authenticated user
instagramPostRouter.get("/", (req, res, next) =>
  instagramPostController.getAllPostsByUserId(req, res, next)
);

// Delete a post by id (for authenticated user)
instagramPostRouter.delete("/:id", (req, res, next) =>
  instagramPostController.deletePostById(req, res, next)
);

export default instagramPostRouter;
