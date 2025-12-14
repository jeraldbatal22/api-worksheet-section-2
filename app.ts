import express, {
  type Request,
  type Response,
} from "express";
import bodyParser from "body-parser";
import todoRouter from "./routes/todo.routes.ts";
import calculatorRouter from "./routes/calculator.routes.ts";
import shortenUrlRouter from "./routes/shorten-url.routes.ts";
import pokemonRouter from "./routes/pokemon.routes.ts";
import currencyConvertRouter from "./routes/currency-converter.routes.ts";
import bookmarkRouter from "./routes/bookmark.routes.ts";
import videoDownloaderRouter from "./routes/video-downloader.routes.ts";
import googleDriveRouter from "./routes/google-drive.routes.ts";
import chatRouter from "./routes/chat.routes.ts";
import {  verifyAccessToken } from "./utils/index.ts";
import authRouter from "./routes/auth.routes.ts";
import authorizeMiddleware from "./middleware/auth.middleware.ts";
import errorMiddleware from "./middleware/error-handler.middleware.ts";
import connectToDatabase from "./database/ps.ts";
import instagramPostRouter from "./routes/instagram.routes.ts";
import publicRouter from "./routes/public.routes.ts";
import createRateLimiter from "./middleware/rate-limiter.middleware.ts";

const app = express();
app.use(bodyParser.json());

// ROUTES
app.get("/", (req, res) => {
  res.send("HELLO")
});
app.use(createRateLimiter({}));
app.use("/api/v1/auth", authRouter);
app.get("/api/v1/protected", authorizeMiddleware, (req, res) => {
  res.send("Hello to protected routes");
});
app.use("/api/v1/todos", authorizeMiddleware, todoRouter);
app.use("/api/v1/calculator", authorizeMiddleware, calculatorRouter);
app.use("/api/v1/shorten-url", authorizeMiddleware, shortenUrlRouter);
app.use("/api/v1/currency-convert", authorizeMiddleware, currencyConvertRouter);
app.use("/api/v1/pokemons", authorizeMiddleware, pokemonRouter);
app.use("/api/v1/bookmarks", authorizeMiddleware, bookmarkRouter);
app.use("/api/v1/video-downloader", authorizeMiddleware, videoDownloaderRouter);
// app.use("/api/v1/google-drive", authenticate, googleDriveRouter);
app.use("/api/v1/chats", authorizeMiddleware, chatRouter);
app.use("/api/v1/public", publicRouter);
app.use("/api/v1/instagram/posts", authorizeMiddleware, instagramPostRouter);

app.get("/session/status", authorizeMiddleware, (req: Request, res: Response) => {
  try {
    // The authenticate middleware should decode and verify the JWT,
    // and attach the decoded payload to req.user (you may need to adjust this if your implementation is different)
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ error: true, message: "No token provided" });
    }
    const token = authHeader.substring(7);
    // verifyAccessToken should verify and decode JWT, returning its payload (e.g., { username, exp, iat })
    const payload = verifyAccessToken(token);
    if (!payload || !payload.exp) {
      return res.status(401).json({ error: true, message: "Invalid token" });
    }
    const now = Math.floor(Date.now() / 1000);
    const timeLeft = payload.exp - now;
    if (timeLeft <= 0) {
      return res.status(401).json({ error: true, message: "Token expired" });
    }
    res.json({
      message: "Session is valid",
      expiresIn: `${timeLeft} seconds`,
    });
  } catch (err) {
    return res
      .status(401)
      .json({ error: true, message: "Invalid or expired token" });
  }
});

app.use(errorMiddleware);

if (process.env.NODE_ENV !== "test") {
  app.listen(3000 as any, '0.0.0.0', async () => {
    await connectToDatabase();
    console.log(`Server running at http://localhost:${3000}`);
  });
}

export {
  app,
  // authenticate,
  // isSessionValid,
  // SESSION_DURATION,
  // DEFAULT_USERNAME,
  // DEFAULT_PASSWORD,
};

// const { createServer } = require('http');

// const USERNAME = "admin"
// const PASSWORD = "cats123"
// const hostname = '127.0.0.1';
// const port = 3000;
// const server = createServer((req, res) => {
//   res.statusCode = 200;
//   res.setHeader('Content-Type', 'text/plain');
//   res.end('Hello World');
// });
// server.listen(port, hostname, () => {
//   console.log(`Server running at http://${hostname}:${port}/`);
// })
