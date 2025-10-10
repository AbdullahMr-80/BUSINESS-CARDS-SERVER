/** Catch-all 404 for any route we didn't handle */
export function notFound(_req, _res, next) {
  next(Object.assign(new Error("Not Found"), { status: 404 }));
}
