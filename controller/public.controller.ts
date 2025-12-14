import express, { type Response } from "express";
import path from "path";
import { getUploadedFilePath } from "../utils/file-system.utls.ts";

class PublicController {
  async getFile(req: any, res: Response) {
    const filePath = req.query.filePath;
    const finalPath = getUploadedFilePath(filePath, "");
    res.sendFile(finalPath)
  }
}

export default new PublicController();