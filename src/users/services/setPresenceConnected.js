import { User } from "../models/user.js";

export async function setPresenceConnected(userId, isConnected) {
  await User.findByIdAndUpdate(
    userId,
    {
      $set: {
        "presence.isConnected": isConnected,
        "presence.lastSeen": new Date(),
      },
    },
    { new: false }
  ).exec();
}
