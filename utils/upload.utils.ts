import multer from "multer";
import type { RequestHandler } from "express";

const inMemoryStorage = multer.memoryStorage();
const upload = multer({ storage: inMemoryStorage });

const uploadSingleFile: RequestHandler = upload.single("file"); // for single file upload

export { uploadSingleFile };
