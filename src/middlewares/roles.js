import { Card } from "../cards/models/card.js";

const isDev = process.env.NODE_ENV !== "production";
const logDenied = (req, reason) => {
  if (!isDev) return;
  const uid = req.user?._id ? String(req.user._id) : "anonymous";
  // small, single-line, grep-able
  console.warn(
    `[roles] DENY uid=${uid} method=${req.method} url=${req.originalUrl} reason="${reason}"`
  );
};

/** Allow only admins */
export function requireAdmin(req, _res, next) {
  if (req.user?.isAdmin) return next();

  logDenied(req, "admin privileges required");
  const err = new Error("Access denied: admin privileges are required.");
  err.status = 403;
  next(err);
}

/** Allow business users (or admins) */
export function requireBusiness(req, _res, next) {
  if (req.user?.isAdmin || req.user?.isBusiness) return next();

  logDenied(req, "business or admin required");
  const err = new Error(
    "Access denied: only business users or admins can perform this action."
  );
  err.status = 403;
  next(err);
}

/** Alias for readability in routes */
export const requireBusinessOrAdmin = requireBusiness;

/** Allow only the card owner or an admin */
export async function requireCardOwnerOrAdmin(req, _res, next) {
  try {
    if (!req.user) {
      logDenied(req, "unauthenticated user");
      const err = new Error("Unauthorized: user authentication is required.");
      err.status = 401;
      return next(err);
    }

    if (req.user.isAdmin) return next(); // admins always OK

    const cardId = req.params.id;
    if (!cardId) {
      logDenied(req, "missing card id");
      const err = new Error("Invalid request: card ID is missing.");
      err.status = 400;
      return next(err);
    }

    const card = await Card.findById(cardId).select("owner").lean().exec();
    if (!card) {
      logDenied(req, "card not found");
      const err = new Error(
        "Card not found: the requested card does not exist."
      );
      err.status = 404;
      return next(err);
    }

    if (String(card.owner) === String(req.user._id)) return next();

    logDenied(req, "not owner and not admin");
    const err = new Error(
      "Access denied: only the card owner or an admin can modify this card."
    );
    err.status = 403;
    next(err);
  } catch (err) {
    next(err);
  }
}
