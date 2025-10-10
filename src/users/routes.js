import { Router } from "express";
import { validateBody, validateQuery } from "../middlewares/validate.js";
import {
  blockToggleSchema,
  changeEmailSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  listUsersQuerySchema,
  loginSchema,
  presenceToggleSchema,
  registerUserSchema,
  resetPasswordSchema,
  updateUserSchema,
} from "./validators.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";
import {
  forgotPassword,
  getById,
  list,
  login,
  register,
  resetPassword,
  setBlocked,
  setPresence,
  updateEmail,
  updatePassword,
  updateProfile,
} from "./controller.js";
import { requireAuth } from "../middlewares/auth.js";
import { requireAdmin } from "../middlewares/roles.js";
import { requireSelfOrAdmin } from "../middlewares/access.js";

const router = Router();

router.post("/", validateBody(registerUserSchema), asyncHandler(register));
router.post("/login", validateBody(loginSchema), asyncHandler(login));
router.get(
  "/",
  requireAuth,
  requireAdmin,
  validateQuery(listUsersQuerySchema),
  asyncHandler(list)
);

router.get(
  "/:id",
  requireAuth,
  requireSelfOrAdmin("id"),
  asyncHandler(getById)
);

router.patch(
  "/:id",
  requireAuth,
  requireSelfOrAdmin("id"),
  validateBody(updateUserSchema),
  asyncHandler(updateProfile)
);

router.patch(
  "/:id/block",
  requireAuth,
  requireAdmin,
  validateBody(blockToggleSchema),
  asyncHandler(setBlocked) // will return 400 JSON instead of crashing
);

router.patch(
  "/:id/presence",
  requireAuth,
  requireAdmin,
  validateBody(presenceToggleSchema),
  asyncHandler(setPresence)
);

router.patch(
  "/:id/email",
  requireAuth,
  requireSelfOrAdmin("id"),
  validateBody(changeEmailSchema),
  asyncHandler(updateEmail)
);

router.patch(
  "/:id/update-password",
  requireAuth,
  requireSelfOrAdmin("id"),
  validateBody(changePasswordSchema),
  asyncHandler(updatePassword)
);

router.post(
  "/forgot-password",
  validateBody(forgotPasswordSchema),
  asyncHandler(forgotPassword)
);

router.post(
  "/reset-password",
  validateBody(resetPasswordSchema),
  asyncHandler(resetPassword)
);

export default router;
