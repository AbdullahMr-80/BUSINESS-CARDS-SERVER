import express from "express";
import { appConfig } from "./config/env.js";
import cors from "cors";
import {
  connectToDatabase,
  disconnectFromDatabase,
  getDbState,
} from "./db/connection.js";
import { notFound } from "./middlewares/notFound.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import usersRouter from "./users/routes.js";
import cardsRouter from "./cards/routes.js";
import { fileLogger } from "./middlewares/fileLogger.js";
import { httpLogger } from "./middlewares/httpLogger.js";
import { resolveMongoUri } from "./config/mongo.js";

const app = express();

app.use(express.json({ limit: "1mb" }));

// Log requests to console (Morgan)
if (appConfig.nodeEnv !== "production") {
  app.use(httpLogger);
}

// Log errors (≥400) into /logs folder
app.use(fileLogger);

//Strict CORS: only allow your configured FE origins.
const allowlist = new Set(appConfig.corsOrigins);
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowlist.has(origin)) return callback(null, true);
      return callback(new Error(`Not allowed by CORS: ${origin}`));
    },
    credentials: true,
  })
);

app.use("/users", usersRouter);
app.use("/cards", cardsRouter);

//Shows DB state so you can confirm Mongo connectivity
app.get("/health", (_req, res) => {
  res.json({ status: "ok", env: appConfig.nodeEnv, db: getDbState() });
});

const port = appConfig.port;
const server = app.listen(port);

async function start() {
  try {
    await connectToDatabase(resolveMongoUri(), { seed: true });
    if (server && server.listening)
      console.log(`HTTP server listening on http://localhost:${port}`);
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
}

async function shutdown(signal) {
  try {
    console.log(`\n${signal} received. Closing server...`);
    if (server && server.listening) {
      await new Promise((resolve, reject) =>
        server.close((err) => (err ? reject(err) : resolve()))
      );
    }
    await disconnectFromDatabase();
    console.log("Shutdown complete.");
    process.exit(0);
  } catch (err) {
    console.error("Error during shutdown:", err);
    process.exit(1);
  }
}

process.on("SIGINT", () => void shutdown("SIGINT"));
process.on("SIGTERM", () => void shutdown("SIGTERM"));

app.use(notFound);
app.use(errorHandler);

void start();
