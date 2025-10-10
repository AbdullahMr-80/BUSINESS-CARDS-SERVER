import fs from "fs";
import path from "path";

// Directory for logs
const logsDir = path.resolve("logs");

// Ensure folder exists
if (!fs.existsSync("logs")) {
  fs.mkdirSync(logsDir, { recursive: true });
}

export function fileLogger(req, res, next) {
  // Capture response finish event
  res.on("finish", () => {
    if (res.statusCode >= 400) {
      const date = new Date();
      const logFile = path.join(
        logsDir,
        `${date.toISOString().split("T")[0]}.log`
      );
      const logEntry = [
        `[${date.toISOString()}]`,
        `Status: ${res.statusCode}`,
        `URL: ${req.originalUrl}`,
        `Method: ${req.method}`,
        `Message: ${res.statusMessage || "No message"}`,
      ].join(" | ");
      fs.appendFile(logFile, logEntry + "\n", (err) => {
        if (err) console.error("[fileLogger] Failed to write log:", err);
      });
    }
  });
  next();
}
