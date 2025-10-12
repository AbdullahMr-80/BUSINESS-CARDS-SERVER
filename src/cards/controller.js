import { createCardDoc } from "./services/createCardDoc.js";
import { getCardByIdSvc } from "./services/getCardById.js";
import { getCardByBizSvc } from "./services/getCardByBiz.js";
import { listCardsSvc } from "./services/listCards.js";
import { listMyCardsSvc } from "./services/listMyCards.js";
import { updateCardFieldsSvc } from "./services/updateCardFields.js";
import { deleteCardSvc } from "./services/deleteCard.js";
import { toggleLikeSvc } from "./services/toggleLike.js";
import { setNewBizNumberSvc } from "./services/setNewBizNumber.js";

// Create a new card (business or admin only)
export const createCard = async (req, res) => {
  const card = await createCardDoc({ ownerId: req.user._id, input: req.body });
  res.status(201).json(card);
};

export const getCardById = async (req, res) => {
  const card = await getCardByIdSvc({
    cardId: req.params.id,
    viewerId: req.user?._id,
  });
  if (!card) throw Object.assign(new Error("Card not found"), { status: 404 });
  res.json(card);
};

export const getCardByBiz = async (req, res) => {
  const card = await getCardByBizSvc({
    bizNumber: req.params.bizNumber,
    viewerId: req.user?._id,
  });
  if (!card) throw Object.assign(new Error("Card not found"), { status: 404 });
  res.json(card);
};

export const listCards = async (req, res) => {
  const q = req.validatedQuery ?? req.query;
  const result = await listCardsSvc({ ...q, viewerId: req.user?._id });
  res.json(result);
};

export const listMyCards = async (req, res) => {
  const result = await listMyCardsSvc({ ownerId: req.user._id });
  res.json(result);
};

export const updateCard = async (req, res) => {
  const updated = await updateCardFieldsSvc({
    cardId: req.params.id,
    updates: req.body,
    user: req.user,
  });
  if (!updated) {
    throw Object.assign(new Error("Card not found or not authorized"), {
      status: 404,
    });
  }
  res.json(updated);
};

export const deleteCard = async (req, res) => {
  const deleted = await deleteCardSvc({
    cardId: req.params.id,
    user: req.user,
  });
  if (!deleted) {
    throw Object.assign(new Error("Card not found or not authorized"), {
      status: 404,
    });
  }
  res.status(204).send();
};

export const toggleLike = async (req, res) => {
  const result = await toggleLikeSvc({
    cardId: req.params.id,
    userId: req.user._id,
  });
  if (!result)
    throw Object.assign(new Error("Card not found"), { status: 404 });
  res.json(result);
};

export const setNewBizNumber = async (req, res) => {
  const updated = await setNewBizNumberSvc({
    cardId: req.params.id,
    incomingBizNumber: req.body?.bizNumber,
  });
  if (!updated)
    throw Object.assign(new Error("Card not found"), { status: 404 });
  res.json({ _id: updated._id, bizNumber: updated.bizNumber });
};
