import { Card } from "../models/card.js";

export async function toggleLikeSvc({ cardId, userId }) {
  const card = await Card.findById(cardId).exec();
  if (!card) return null;

  const hasLiked = card.likes.some((u) => u.equals(userId));
  if (hasLiked) card.likes.pull(userId);
  else card.likes.push(userId);

  await card.save();
  return { _id: card._id, liked: !hasLiked, likesCount: card.likes.length };
}
