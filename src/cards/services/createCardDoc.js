import { Card } from "../models/card.js";
import { generateBizNumber } from "../helpers/generateBizNumber.js";

// Create a single card document (used by both controllers & seeds)
export async function createCardDoc({ ownerId, input }) {
  const bizNumber = await generateBizNumber();
  const card = await Card.create({
    ...input,
    owner: ownerId,
    bizNumber,
  });
  return card;
}
