import rateLimit from "express-rate-limit";

// Factory function to create a rate limiter middleware with dynamic config
const createRateLimiter = ({
  windowMs = 5 * 60 * 1000, // 5 minutes in milliseconds (total time window)
  max = 5, // total number of requests allowed per window
  message = "Too many requests, please try again later.",
}) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      status: "error",
      message,
      code: 429,
    },
    headers: true,
  });
};

export default createRateLimiter;
