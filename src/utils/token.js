import crypto from "crypto";

/** Create a cryptographically-strong random token (hex) */
export function createRawToken(bytes = 32) {
  return crypto.randomBytes(bytes).toString("hex"); // e.g., 64 hex chars
}

/** Deterministic SHA-256 hex hash for storing/lookup */
export function sha256Hex(input) {
  return crypto.createHash("sha256").update(input, "utf8").digest("hex");
}

/** Convenience: make raw token + its sha256 hash pair */
export function makeTokenPair(bytes = 32) {
  const raw = createRawToken(bytes);
  return { raw, hash: sha256Hex(raw) };
}
