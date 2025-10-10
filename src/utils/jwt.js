import jwt from "jsonwebtoken";
import { appConfig } from "../config/env.js";

const EXPIRES_IN = "7d";

export function signAuthToken(payload) {
  return jwt.sign(payload, appConfig.jwtSecert, { expiresIn: EXPIRES_IN });
}
