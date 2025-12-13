import { asyncHandler } from "../middleware/async-handler.ts";
import { type Request, type Response } from "express";
import fs from "fs/promises";
import path from "path";
// import { fileURLToPath } from "url";
import multer from "multer";
import type { T_File } from "../types/index.ts";
import { readFiles, writeFiles } from "../utils/index.ts";

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// // Storage directories
// const INSTAGRAM_IMAGES_DIR = path.join(__dirname, "../storage/instagram-images");
// const INSTAGRAM_VIDEOS_DIR = path.join(__dirname, "../storage/instagram-videos");
const INSTAGRAM_IMAGES_DIR = path.join(process.cwd(), "../storage/instagram-images");
const INSTAGRAM_VIDEOS_DIR = path.join(process.cwd(), "../storage/instagram-videos");

// Ensure storage directories exist
async function ensureDirectories() {
  try {
    await fs.mkdir(INSTAGRAM_IMAGES_DIR, { recursive: true });
    await fs.mkdir(INSTAGRAM_VIDEOS_DIR, { recursive: true });
  } catch (error) {
    console.error("Error creating directories:", error);
  }
}

// Initialize directories on module load
ensureDirectories();

// Image storage configuration
const imageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, INSTAGRAM_IMAGES_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext);
    cb(null, `${baseName}-${uniqueSuffix}${ext}`);
  },
});

// Video storage configuration
const videoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, INSTAGRAM_VIDEOS_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext);
    cb(null, `${baseName}-${uniqueSuffix}${ext}`);
  },
});

// File filter for images
const imageFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed"));
  }
};

// File filter for videos
const videoFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.mimetype.startsWith("video/")) {
    cb(null, true);
  } else {
    cb(new Error("Only video files are allowed"));
  }
};

// Multer upload configurations
const uploadImage = multer({
  storage: imageStorage,
  fileFilter: imageFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit for images
  },
});

const uploadVideo = multer({
  storage: videoStorage,
  fileFilter: videoFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit for videos
  },
});

// IMAGE CRUD Operations

// Create image
const createImage = asyncHandler(async (req: Request & { file?: Express.Multer.File }, res: Response) => {
  if (!req.file) {
    throw new Error("Image file is required");
  }

  const files = await readFiles(INSTAGRAM_IMAGES_DIR);
  const newFile: T_File = {
    id: Date.now().toString() + "-" + Math.round(Math.random() * 1e9),
    filename: req.file.filename,
    originalName: req.file.originalname,
    size: req.file.size,
    mimeType: req.file.mimetype,
    uploadedAt: new Date().toISOString(),
  };

  files.push(newFile);
  await writeFiles(INSTAGRAM_IMAGES_DIR, files);

  res.status(201).json({
    success: true,
    message: "Image uploaded successfully",
    data: newFile,
  });
});

// Read all images
const getAllImages = asyncHandler(async (req: Request, res: Response) => {
  const files = await readFiles(INSTAGRAM_IMAGES_DIR);
  console.log(files, "files")

  res.status(200).json({
    success: true,
    message: "Images retrieved successfully",
    data: files,
  });
});

// Read single image
const getImage = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const files = await readFiles(INSTAGRAM_IMAGES_DIR);
  const file = files.find((f) => f.id === id);

  if (!file) {
    throw new Error("Image not found");
  }

  const filePath = path.join(INSTAGRAM_IMAGES_DIR, file.filename);

  try {
    await fs.access(filePath);
  } catch (error) {
    throw new Error("Image file not found on disk");
  }

  res.setHeader("Content-Type", file.mimeType);
  res.setHeader(
    "Content-Disposition",
    `inline; filename="${file.originalName}"`
  );

  const fileBuffer = await fs.readFile(filePath);
  res.send(fileBuffer);
});

// Update image
const updateImage = asyncHandler(async (req: Request & { file?: Express.Multer.File }, res: Response) => {
  const { id } = req.params;

  if (!req.file) {
    throw new Error("Image file is required");
  }

  const files = await readFiles(INSTAGRAM_IMAGES_DIR);
  const fileIndex = files.findIndex((f) => f.id === id);

  if (fileIndex === -1) {
    throw new Error("Image not found");
  }

  const oldFile = files[fileIndex];
  const oldFilePath = path.join(INSTAGRAM_IMAGES_DIR, oldFile.filename);

  // Delete old file from disk
  try {
    await fs.unlink(oldFilePath);
  } catch (error) {
    console.warn(`Old image file not found on disk: ${oldFilePath}`);
  }

  // Update with new file
  const updatedFile: T_File = {
    id: oldFile.id, // Keep the same ID
    filename: req.file.filename,
    originalName: req.file.originalname,
    size: req.file.size,
    mimeType: req.file.mimetype,
    uploadedAt: new Date().toISOString(),
  };

  files[fileIndex] = updatedFile;
  await writeFiles(INSTAGRAM_IMAGES_DIR, files);

  res.status(200).json({
    success: true,
    message: "Image updated successfully",
    data: updatedFile,
  });
});

// Delete image
const deleteImage = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const files = await readFiles(INSTAGRAM_IMAGES_DIR);
  const fileIndex = files.findIndex((f) => f.id === id);

  if (fileIndex === -1) {
    throw new Error("Image not found");
  }

  const deletedFile = files[fileIndex];
  const filePath = path.join(INSTAGRAM_IMAGES_DIR, deletedFile.filename);

  // Delete file from disk
  try {
    await fs.unlink(filePath);
  } catch (error) {
    console.warn(`Image file not found on disk: ${filePath}`);
  }

  // Remove from list
  files.splice(fileIndex, 1);
  await writeFiles(INSTAGRAM_IMAGES_DIR, files);

  res.status(200).json({
    success: true,
    message: "Image deleted successfully",
    data: deletedFile,
  });
});

// VIDEO CRUD Operations

// Create video
const createVideo = asyncHandler(async (req: Request & { file?: Express.Multer.File }, res: Response) => {
  if (!req.file) {
    throw new Error("Video file is required");
  }

  const files = await readFiles(INSTAGRAM_VIDEOS_DIR);
  const newFile: T_File = {
    id: Date.now().toString() + "-" + Math.round(Math.random() * 1e9),
    filename: req.file.filename,
    originalName: req.file.originalname,
    size: req.file.size,
    mimeType: req.file.mimetype,
    uploadedAt: new Date().toISOString(),
  };

  files.push(newFile);
  await writeFiles(INSTAGRAM_VIDEOS_DIR, files);

  res.status(201).json({
    success: true,
    message: "Video uploaded successfully",
    data: newFile,
  });
});

// Read all videos
const getAllVideos = asyncHandler(async (req: Request, res: Response) => {
  const files = await readFiles(INSTAGRAM_VIDEOS_DIR);

  res.status(200).json({
    success: true,
    message: "Videos retrieved successfully",
    data: files,
  });
});

// Read single video
const getVideo = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const files = await readFiles(INSTAGRAM_VIDEOS_DIR);
  const file = files.find((f) => f.id === id);

  if (!file) {
    throw new Error("Video not found");
  }

  const filePath = path.join(INSTAGRAM_VIDEOS_DIR, file.filename);

  try {
    await fs.access(filePath);
  } catch (error) {
    throw new Error("Video file not found on disk");
  }

  res.setHeader("Content-Type", file.mimeType);
  res.setHeader(
    "Content-Disposition",
    `inline; filename="${file.originalName}"`
  );

  const fileBuffer = await fs.readFile(filePath);
  res.send(fileBuffer);
});

// Update video
const updateVideo = asyncHandler(async (req: Request & { file?: Express.Multer.File }, res: Response) => {
  const { id } = req.params;

  if (!req.file) {
    throw new Error("Video file is required");
  }

  const files = await readFiles(INSTAGRAM_VIDEOS_DIR);
  const fileIndex = files.findIndex((f) => f.id === id);

  if (fileIndex === -1) {
    throw new Error("Video not found");
  }

  const oldFile = files[fileIndex];
  const oldFilePath = path.join(INSTAGRAM_VIDEOS_DIR, oldFile.filename);

  // Delete old file from disk
  try {
    await fs.unlink(oldFilePath);
  } catch (error) {
    console.warn(`Old video file not found on disk: ${oldFilePath}`);
  }

  // Update with new file
  const updatedFile: T_File = {
    id: oldFile.id, // Keep the same ID
    filename: req.file.filename,
    originalName: req.file.originalname,
    size: req.file.size,
    mimeType: req.file.mimetype,
    uploadedAt: new Date().toISOString(),
  };

  files[fileIndex] = updatedFile;
  await writeFiles(INSTAGRAM_VIDEOS_DIR, files);

  res.status(200).json({
    success: true,
    message: "Video updated successfully",
    data: updatedFile,
  });
});

// Delete video
const deleteVideo = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const files = await readFiles(INSTAGRAM_VIDEOS_DIR);
  const fileIndex = files.findIndex((f) => f.id === id);

  if (fileIndex === -1) {
    throw new Error("Video not found");
  }

  const deletedFile = files[fileIndex];
  const filePath = path.join(INSTAGRAM_VIDEOS_DIR, deletedFile.filename);

  // Delete file from disk
  try {
    await fs.unlink(filePath);
  } catch (error) {
    console.warn(`Video file not found on disk: ${filePath}`);
  }

  // Remove from list
  files.splice(fileIndex, 1);
  await writeFiles(INSTAGRAM_VIDEOS_DIR, files);

  res.status(200).json({
    success: true,
    message: "Video deleted successfully",
    data: deletedFile,
  });
});

// Export multer middleware for use in routes
export { uploadImage, uploadVideo };
export {
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
};

