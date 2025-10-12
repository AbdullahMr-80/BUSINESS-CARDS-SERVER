import { Card } from "../models/card.js";

export async function listMyCardsSvc({ ownerId }) {
  const uid = String(ownerId);
  const cards = await Card.find({ owner: ownerId }).lean().exec();
  return cards.map((c) => ({
    ...c,
    likesCount: c.likes?.length ?? 0,
    likedByMe: c.likes?.some((u) => String(u) === uid) || false,
  }));
}
