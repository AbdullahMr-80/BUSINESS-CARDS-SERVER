/** Global error handler returning a consistent JSON shape */
/* eslint-disable-next-line no-unused-vars */
export function errorHandler(err, _req, res, _next) {
  // Handle Mongo duplicate key (e.g., bizNumber)
  if (err?.code === 11000) {
    const fields = Object.keys(err.keyPattern ?? {});
    const message = fields.length
      ? `Duplicate value for ${fields.join(", ")}`
      : "Duplicate key error";
    res.locals.errorMessage = message;
    return res.status(409).json({ error: { status: 409, message } });
  }

  const status = typeof err?.status === "number" ? err.status : 500;
  const message =
    typeof err?.message === "string" && err.message
      ? err.message
      : "Internal Server Error";

  if (process.env.NODE_ENV !== "production") {
    console.error("[error]", status, message);
    console.error(err);
  }

  // expose for file logger
  res.locals.errorMessage = message;

  res.status(status).json({ error: { status, message } });
}
