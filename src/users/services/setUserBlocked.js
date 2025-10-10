import { toPublic } from "../controller.js";
import { User } from "../models/user.js";

export async function setUserBlocked(userId, blocked) {
  const user = await User.findByIdAndUpdate(
    userId,
    { $set: { "status.blocked": blocked } },
    { new: true }
  ).exec();
  return user ? toPublic(user.toObject()) : null;
}
