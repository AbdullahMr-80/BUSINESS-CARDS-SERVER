import { User } from "../models/user.js";
import { verifyPassword } from "./passwordHelper.js";

export async function verifyCredentials(email, password) {
  const user = await User.findOne({ email: email.toLowerCase() }).exec();
  if (!user) return null;
  const ok = await verifyPassword(password, user.password);
  return ok ? user : null;
}
