import { User } from "../models/user.js";

export async function getUserSummaries() {
  try {
    const [total, blocked, business, admins] = await Promise.all([
      User.estimatedDocumentCount().exec(),
      User.countDocuments({ "status.blocked": true }).exec(),
      User.countDocuments({ isBusiness: true }).exec(),
      User.countDocuments({ isAdmin: true }).exec(),
    ]);
    return { total, blocked, business, admins };
  } catch (error) {
    console.error("Error counting users:", error);
    throw error;
  }
}
