import multer from "multer";
import type { FileFilterCallback } from "multer";
import path from "path";
import type { Request } from "express";

interface UploadOptions {
  allowedTypes?: string[];
  maxSizeMB?: number;
  folder?: string;
}

export const createUploader = ({
  allowedTypes = ["image/jpeg", "image/png"],
  maxSizeMB = 5,
  folder = "uploads",
}: UploadOptions = {}) => {
  const storage = multer.diskStorage({
    destination: folder,
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname);
      const fileName = `${Date.now()}-${Math.round(
        Math.random() * 1e9
      )}${ext}`;
      cb(null, fileName);
    },
  });

  const fileFilter = (
    _req: Request,
    file: Express.Multer.File,
    cb: FileFilterCallback
  ) => {
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error("Invalid file type"));
    }
    cb(null, true);
  };

  return multer({
    storage,
    fileFilter,
    limits: {
      fileSize: maxSizeMB * 1024 * 1024,
    },
  });
};
