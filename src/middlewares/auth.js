import jwt from "jsonwebtoken";
import { appConfig } from "../config/env.js";

/** Require Authorization: Bearer <token> and attach req.user */
export function requireAuth(req, _res, next) {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");

  if (scheme !== "Bearer" || !token) {
    return next(Object.assign(new Error("Unauthorized"), { status: 401 }));
  }

  try {
    const payload = jwt.verify(token, appConfig.jwtSecert);
    req.user = payload;
    next();
  } catch {
    next(Object.assign(new Error("Unauthorized"), { status: 401 }));
  }
}
