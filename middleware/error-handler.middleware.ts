import type { Request, Response, NextFunction } from "express";

// Custom error interface
interface CustomError extends Error {
  statusCode?: number;
  code?: number | string;
  detail?: string;
  keyValue?: Record<string, any>;
  errors?: Record<
    string,
    { message: string }
  >;
}

const errorMiddleware = (
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let error: Partial<CustomError> & Record<string, any> = { ...err };
  error.message = err.message;

  console.error("Error:", err);

  // Handle PostgreSQL (pg) specific errors
  // Example: unique violation (duplicate key)
  // See: https://www.postgresql.org/docs/current/errcodes-appendix.html
  if (err.code === "23505") {
    // Unique violation
    // Try to extract field from error detail, if available
    let message = "Duplicate value";
    if (typeof err.detail === "string") {
      // Example: 'Key (username)=(existinguser) already exists.'
      const match = err.detail.match(/\(([^)]+)\)=/);
      if (match && match[1]) {
        const field = match[1];
        message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
      }
    }
    error = { message, statusCode: 400 };
  }

  // Handle general PostgreSQL connection errors
  if (
    err.code === "ECONNREFUSED" ||
    err.code === "ENOTFOUND" ||
    err.code === "EHOSTUNREACH"
  ) {
    error = {
      message: "Database connection error",
      statusCode: 500,
    };
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    error = {
      message: "Invalid token. Please log in again",
      statusCode: 401,
    };
  }
  if (err.name === "TokenExpiredError") {
    error = {
      message: "Token expired. Please log in again",
      statusCode: 401,
    };
  }
  if (err.name === "NotBeforeError") {
    error = {
      message: "Token not active yet",
      statusCode: 401,
    };
  }

  // Multer file upload errors
  if (err.name === "MulterError") {
    let message = "File upload error";
    if (err.code === "LIMIT_FILE_SIZE") {
      message = "File size too large";
    } else if (err.code === "LIMIT_FILE_COUNT") {
      message = "Too many files";
    } else if (err.code === "LIMIT_UNEXPECTED_FILE") {
      message = "Unexpected file field";
    }
    error = {
      message,
      statusCode: 400,
    };
  }

  // Syntax error (JSON parsing)
  const anyErr = err as any;
  if (
    err instanceof SyntaxError &&
    typeof anyErr.status === "number" &&
    anyErr.status === 400 &&
    "body" in err
  ) {
    error = {
      message: "Invalid JSON format",
      statusCode: 400,
    };
  }

  // Default to 500 server error if statusCode not already set
  const statusCode =
    error.statusCode || (err.statusCode as number) || 500;
  const message = error.message || "Server Error";

  res.status(statusCode).json({
    error: true,
    message,
    statusCode: statusCode,
    // ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

export default errorMiddleware;
