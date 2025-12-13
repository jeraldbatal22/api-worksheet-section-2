import { asyncHandler } from "../middleware/async-handler.ts";
import axios from "axios";
import { type Request, type Response } from "express";

/**
 * Downloads a video from a given URL and returns it as a file
 * @param url - The URL of the video to download
 * @returns Object containing the file and a success message
 */
const downloadVideo = asyncHandler(async (req: Request, res: Response) => {
  const { url } = req.body;

  if (!url || typeof url !== "string") {
    throw new Error("URL is required and must be a string");
  }

  try {
    // Validate URL format
    new URL(url);
  } catch (error) {
    throw new Error("Invalid URL format");
  }

  // Fetch the video from the URL
  let response;
  try {
    response = await axios({
      method: "GET",
      url: url,
      responseType: "stream",
      timeout: 60000, // 60 second timeout (increased for slow connections)
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      validateStatus: (status) => status >= 200 && status < 400,
    });
  } catch (error: any) {
    if (error.code === "ETIMEDOUT" || error.code === "ECONNABORTED") {
      throw new Error(
        `Connection timeout: Unable to reach the video URL. The server may be unreachable or blocked. Please try a different video URL.`
      );
    }
    if (error.code === "ENOTFOUND") {
      throw new Error(`DNS error: Could not resolve the hostname. Please check the URL.`);
    }
    if (error.code === "ECONNREFUSED") {
      throw new Error(`Connection refused: The server rejected the connection.`);
    }
    if (error.response) {
      throw new Error(
        `Failed to download video: Server returned status ${error.response.status}`
      );
    }
    throw new Error(
      `Failed to download video: ${error.message || "Unknown error"}`
    );
  }

  // Extract filename from URL or use default
  const urlPath = new URL(url).pathname;
  const filename =
    urlPath.split("/").pop() || `video_${Date.now()}.mp4`;

  // Set headers for file download
  res.setHeader("Content-Type", response.headers["content-type"] || "video/mp4");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${filename}"`
  );
  res.setHeader(
    "Content-Length",
    response.headers["content-length"] || "unknown"
  );
  res.setHeader(
    "X-Message",
    "Video downloaded successfully"
  );

  // Pipe the video stream to the response
  response.data.pipe(res);

  // Note: In Express, we can't return a File object directly.
  // The file is sent as a stream in the response.
  // The message is included in the X-Message header.
});

export { downloadVideo };

