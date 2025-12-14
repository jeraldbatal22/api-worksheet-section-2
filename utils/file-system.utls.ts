import fs from "fs";
import path from "path";

const UPLOAD_DIR = path.join(process.cwd(), "uploads");

export const getUploadedFilePath = (
  folder: string,
  filename: string
): string => {
  return path.join(UPLOAD_DIR, folder, filename);
};

export const fileExists = (filePath: string): boolean => {
  return fs.existsSync(filePath);
};
