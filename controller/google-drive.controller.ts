import { asyncHandler } from "../middleware/async-handler.ts";
import axios from "axios";
import { type Request, type Response } from "express";

/**
 * Uploads a file from a given URL and returns it
 * @param url - The URL of the file to upload/download
 * @returns Object containing the file and a success message
 */
const uploadFile = asyncHandler(async (req: Request, res: Response) => {
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

  // Fetch the file from the URL
  let response;
  try {
    response = await axios({
      method: "GET",
      url: url,
      responseType: "stream",
      timeout: 60000, // 60 second timeout
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      validateStatus: (status) => status >= 200 && status < 400,
    });
  } catch (error: any) {
    if (error.code === "ETIMEDOUT" || error.code === "ECONNABORTED") {
      throw new Error(
        `Connection timeout: Unable to reach the file URL. The server may be unreachable or blocked. Please try a different file URL.`
      );
    }
    if (error.code === "ENOTFOUND") {
      throw new Error(
        `DNS error: Could not resolve the hostname. Please check the URL.`
      );
    }
    if (error.code === "ECONNREFUSED") {
      throw new Error(
        `Connection refused: The server rejected the connection.`
      );
    }
    if (error.response) {
      const status = error.response.status;
      let errorMessage = `Failed to upload file: Server returned status ${status}`;

      if (status === 404) {
        errorMessage = `File not found: The URL "${url}" returned a 404 error. Please verify the file exists and the URL is correct.`;
      } else if (status === 403) {
        errorMessage = `Access forbidden: The server at "${url}" denied access to the file.`;
      } else if (status === 401) {
        errorMessage = `Unauthorized: Authentication required to access the file at "${url}".`;
      } else if (status >= 500) {
        errorMessage = `Server error: The remote server returned status ${status}. Please try again later.`;
      }

      throw new Error(errorMessage);
    }
    throw new Error(
      `Failed to upload file: ${error.message || "Unknown error"}`
    );
  }

  // Extract filename from URL or use default
  const urlPath = new URL(url).pathname;
  const filename = urlPath.split("/").pop() || `file_${Date.now()}`;

  // Set headers for file download
  res.setHeader(
    "Content-Type",
    response.headers["content-type"] || "application/octet-stream"
  );
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  res.setHeader(
    "Content-Length",
    response.headers["content-length"] || "unknown"
  );
  res.setHeader("X-Message", "File uploaded successfully");

  // Pipe the file stream to the response
  response.data.pipe(res);

  // Note: In Express, we can't return a File object directly.
  // The file is sent as a stream in the response.
  // The message is included in the X-Message header.
 
});

export { uploadFile };
