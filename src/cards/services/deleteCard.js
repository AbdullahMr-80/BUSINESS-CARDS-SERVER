import { Card } from "../models/card.js";

export async function deleteCardSvc({ cardId, user }) {
  const filter = user?.isAdmin
    ? { _id: cardId }
    : { _id: cardId, owner: user?._id };
  const deleted = await Card.findOneAndDelete(filter).lean();
  return deleted; // null if not found/unauthorized
}
