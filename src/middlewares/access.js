/**
 * Allow if the requester is admin, or if the route param matches their own id.
 * Usage: router.get("/users/:id", requireAuth, requireSelfOrAdmin("id"), handler)
 */
export function requireSelfOrAdmin(param) {
  return (req, _res, next) => {
    const requester = req.user; // set by requireAuth
    const targetId = String(req.params?.[param] ?? "");

    if (!requester) {
      return next(Object.assign(new Error("Unauthorized"), { status: 401 }));
    }

    const isSelf = targetId && String(requester._id) === targetId;
    if (requester.isAdmin || isSelf) {
      return next();
    }

    return next(Object.assign(new Error("Forbidden"), { status: 403 }));
  };
}
