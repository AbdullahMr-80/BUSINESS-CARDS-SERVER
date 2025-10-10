import { toPublic } from "../controller.js";
import { User } from "../models/user.js";

export async function getUserByIdPublic(userId) {
  try {
    const doc = await User.findById(userId).lean().exec();
    return doc ? toPublic(doc) : null;
  } catch (error) {
    console.error("Error in getUserByIdPublic:", error.message);
    throw error;
  }
}
