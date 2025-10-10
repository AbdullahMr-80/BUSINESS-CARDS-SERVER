import { Card } from "../models/card.js";

/**
 * Generate a unique 6-digit business number (100000–999999).
 * Retries until it finds an unused number.
 */
export async function generateBizNumber() {
  let unique = false;
  let bizNumber;

  while (!unique) {
    bizNumber = Math.floor(100000 + Math.random() * 900000); // random 6-digit number
    const existing = await Card.findOne({ bizNumber }).lean().exec();
    if (!existing) unique = true;
  }

  return bizNumber;
}
