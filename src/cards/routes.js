import { Router } from "express";
import { validateBody, validateQuery } from "../middlewares/validate.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";
import { requireAuth } from "../middlewares/auth.js";
import {
  requireAdmin,
  requireBusinessOrAdmin,
  requireCardOwnerOrAdmin,
} from "../middlewares/roles.js";
import {
  createCard,
  listCards,
  listMyCards,
  updateCard,
  deleteCard,
  toggleLike,
  getCardById,
  getCardByBiz,
  setNewBizNumber,
} from "./controller.js";
import {
  createCardSchema,
  updateCardSchema,
  listCardsQuerySchema,
} from "./validators.js";

const router = Router();

router.get("/", validateQuery(listCardsQuerySchema), asyncHandler(listCards));
router.get("/:id", asyncHandler(getCardById));
router.get("/by-biz/:bizNumber", asyncHandler(getCardByBiz));

// create
router.post(
  "/",
  requireAuth,
  requireBusinessOrAdmin,
  validateBody(createCardSchema),
  asyncHandler(createCard)
);

router.get("/my-cards", requireAuth, asyncHandler(listMyCards));

// update
router.patch(
  "/:id",
  requireAuth,
  requireCardOwnerOrAdmin,
  validateBody(updateCardSchema),
  asyncHandler(updateCard)
);

router.delete(
  "/:id",
  requireAuth,
  requireCardOwnerOrAdmin,
  asyncHandler(deleteCard)
);

router.patch("/:id/like", requireAuth, asyncHandler(toggleLike));

router.patch(
  "/:id/biz-number",
  requireAuth,
  requireAdmin,
  asyncHandler(setNewBizNumber)
);

export default router;
