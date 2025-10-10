import { buildEmailChangedEmails } from "../../mails/emailChnaged.js";
import { sendMail } from "../../utils/mailer.js";
import { verifyPassword } from "../helpers/passwordHelper.js";
import { toPublic } from "../controller.js";
import { User } from "../models/user.js";

/** Change email (self) with password re-auth */
export async function changeEmail(userId, currentPassword, newEmail) {
  const user = await User.findById(userId).exec();
  if (!user) throw Object.assign(new Error("User not found"), { status: 404 });

  const ok = await verifyPassword(currentPassword, user.password);
  if (!ok) {
    throw Object.assign(new Error("Current password is incorrect"), {
      status: 400,
    });
  }
  const email = newEmail.toLowerCase();
  const taken = await User.exists({ _id: { $ne: userId }, email });
  if (taken)
    throw Object.assign(new Error("Email already in use"), { status: 409 });

  const oldEmail = user.email;
  user.email = email;
  await user.save();

  const notices = buildEmailChangedEmails(oldEmail, email);
  await Promise.all([
    sendMail({ to: oldEmail, ...notices.toOld }),
    sendMail({ to: email, ...notices.toNew }),
  ]);

  return toPublic(user.toObject());
}
