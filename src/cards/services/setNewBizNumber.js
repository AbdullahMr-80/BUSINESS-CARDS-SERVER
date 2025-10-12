import { Card } from "../models/card.js";
import { generateBizNumber } from "../helpers/generateBizNumber.js";

export async function setNewBizNumberSvc({ cardId, incomingBizNumber }) {
  let bizNumber = Number(incomingBizNumber);

  if (!incomingBizNumber) {
    bizNumber = await generateBizNumber();
  } else {
    if (
      !Number.isInteger(bizNumber) ||
      bizNumber < 100000 ||
      bizNumber > 999999
    ) {
      const err = new Error("bizNumber must be a 6-digit integer");
      err.status = 400;
      throw err;
    }
    const exists = await Card.exists({ bizNumber }).lean();
    if (exists) {
      const err = new Error("bizNumber already in use");
      err.status = 409;
      throw err;
    }
  }

  const updated = await Card.findByIdAndUpdate(
    cardId,
    { $set: { bizNumber } },
    { new: true, runValidators: true }
  ).lean();

  return updated; // null if not found
}
