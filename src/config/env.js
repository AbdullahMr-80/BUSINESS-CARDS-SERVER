import dotenv from "dotenv";

dotenv.config();

/* validating env vars */
//Ensure required env vars exist
function readstring(key, fallback) {
  const v = process.env[key] ?? fallback;
  if (v === undefined || v === "") {
    throw new Error(`Missing required env var: ${key}`);
  }
  return v;
}

//Convert and validate types
function readNumber(key, fallback) {
  const raw = process.env[key];
  if (raw === undefined || raw === "") return fallback;
  const n = Number(raw);
  if (Number.isNaN(n)) {
    throw new Error(`Env var ${key} must be a number`);
  }
  return n;
}

//Parse structured values
function parseCsv(value) {
  if (!value) return [];
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export const appConfig = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: Number(readstring("PORT")),
  mongoUri: readstring("MONGODB_URI"),
  jwtSecert: readstring("JWT_SECRET"),
  corsOrigins: parseCsv(process.env.CORS_ORIGIN),
  smtp: {
    host: process.env.SMTP_HOST,
    port: readNumber("SMTP_PORT"),
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  appBaseUrl: process.env.APP_BASE_URL,
};
