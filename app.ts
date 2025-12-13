import express, {
  type Request,
  type NextFunction,
  type Response,
} from "express";
import bodyParser from "body-parser";
import todoRouter from "./routes/todo.routes.ts";
import errorMiddleware from "./middleware/error-handler.middleware.ts";
import calculatorRouter from "./routes/calculator.routes.ts";
import shortenUrlRouter from "./routes/shorten-url.routes.ts";
import type { T_Session } from "./types/index.ts";
import pokemonRouter from "./routes/pokemon.routes.ts";
import currencyConvertRouter from "./routes/currency-converter.routes.ts";
import bookmarkRouter from "./routes/bookmark.routes.ts";
import videoDownloaderRouter from "./routes/video-downloader.routes.ts";
import googleDriveRouter from "./routes/google-drive.routes.ts";
import chatRouter from "./routes/chat.routes.ts";
import instagramRouter from "./routes/instagram.routes.ts";
import { JWT_SECRET, PORT } from "./config/env.ts";
import { generateAccessToken, verifyAccessToken } from "./utils/index.ts";
import jwt from "jsonwebtoken";
import connectToDatabase, { pgDatabase } from "./database/ps.ts";
import authRouter from "./routes/auth.routes.ts";
import authorizeMiddleware from "./middleware/auth.middleware.ts";

const DEFAULT_USERNAME: string = "admin";
const DEFAULT_PASSWORD: string = "cats123";

// keep duration exported for tests
const SESSION_DURATION = 20 * 60 * 1000; // 20 minutes
let CURRENT_SESSION: T_Session | null = null;

const app = express();
app.use(bodyParser.json());

// Authentication middleware
async function authenticate(
  req: Request | any,
  res: Response,
  next: NextFunction
): Promise<any> {
  try {
    const authHeader = req.headers.authorization;
    let token;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ error: true, message: "No token provided" });
      return;
    }
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token)
      return res
        .status(401)
        .json({ message: "Unauthorized", statusCode: 401, error: true });

    if (!isSessionValid(token)) {
      res
        .status(401)
        .json({ error: true, message: "Invalid or expired token" });
      return;
    }

    next();
  } catch (error) {
    next(error);
  }
}

// Check if session is valid
function isSessionValid(token: string): any {
  try {
    if (jwt.verify(token, JWT_SECRET! || "secret")) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    return false;
  }
}

// ROUTES
app.get("/", (req, res) => {
  const query = "Select * from users";

  pgDatabase.query(query, (err, result) => {
    if (err) {
      throw new Error((err as any) || "ERROR");
    }
    return res.send({
      data: result.rows,
    });
  });
});
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
app.use("/api/v1/video-downloader", authenticate, videoDownloaderRouter);
app.use("/api/v1/google-drive", authenticate, googleDriveRouter);
app.use("/api/v1/chats", authorizeMiddleware, chatRouter);
app.use("/api/v1/instagram", authenticate, instagramRouter);

app.get("/session/status", authenticate, (req: Request, res: Response) => {
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

// Create a new session when login
function createSession(): T_Session {
  const token = generateAccessToken({ username: DEFAULT_USERNAME });
  const expiresAt = verifyAccessToken(token).exp + SESSION_DURATION;
  CURRENT_SESSION = { token, expiresAt };

  // Auto-invalidate after 1 minute
  setTimeout(() => {
    if (CURRENT_SESSION && CURRENT_SESSION.token === token) {
      CURRENT_SESSION = null;
      console.log("Session expired and invalidated");
    }
  }, SESSION_DURATION);

  return CURRENT_SESSION;
}

app.use(errorMiddleware);

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT || 3000, async () => {
    // await connectToDatabase();
    console.log(`Server running at http://localhost:${PORT || 3000}`);
  });
}

// Export internals for testing and reuse
function clearSession() {
  CURRENT_SESSION = null;
}

export {
  app,
  authenticate,
  isSessionValid,
  createSession,
  clearSession,
  SESSION_DURATION,
  DEFAULT_USERNAME,
  DEFAULT_PASSWORD,
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
