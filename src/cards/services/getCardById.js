import { Card } from "../models/card.js";

export async function getCardByIdSvc({ cardId, viewerId }) {
  const card = await Card.findById(cardId).lean().exec();
  if (!card) return null;

  const uid = viewerId && String(viewerId);
  return {
    ...card,
    likesCount: card.likes?.length ?? 0,
    likedByMe: uid ? card.likes?.some((u) => String(u) === uid) : false,
  };
}
