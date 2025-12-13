import { Router } from "express";
import ShortenUrlController from "../controller/shorten-url.controller.ts";

const shortenUrlRouter = Router();

shortenUrlRouter.post("/", ShortenUrlController.create);
shortenUrlRouter.get("/", ShortenUrlController.getAll);
shortenUrlRouter.get("/:shortCode", ShortenUrlController.getByShortCode);

export default shortenUrlRouter;
