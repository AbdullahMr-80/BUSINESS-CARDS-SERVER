import { appConfig } from "./env.js";

export function resolveMongoUri() {
  const target = String(process.env.APP_DB || "").toLowerCase();

  // Prefer explicit env URIs when target is set
  if (target === "atlas" && process.env.MONGO_URI_ATLAS) {
    return process.env.MONGO_URI_ATLAS;
  }
  if (target === "local" && process.env.MONGO_URI_LOCAL) {
    return process.env.MONGO_URI_LOCAL;
  }

  // Fallback to whatever your env.js already exports
  return appConfig.mongoUri;
}
