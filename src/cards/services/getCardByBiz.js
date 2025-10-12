import { Card } from "../models/card.js";

export async function getCardByBizSvc({ bizNumber, viewerId }) {
  const card = await Card.findOne({ bizNumber: Number(bizNumber) })
    .lean()
    .exec();
  if (!card) return null;

  const uid = viewerId && String(viewerId);
  return {
    ...card,
    likesCount: card.likes?.length ?? 0,
    likedByMe: uid ? card.likes?.some((u) => String(u) === uid) : false,
  };
}
