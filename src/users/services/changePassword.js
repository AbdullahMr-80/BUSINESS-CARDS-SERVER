import { buildPasswordChangedEmail } from "../../mails/passwordChnaged.js";
import { sendMail } from "../../utils/mailer.js";
import { PasswordHistory } from "../models/passwordHistory.js";
import { User } from "../models/user.js";
import bcrypt from "bcrypt";

export async function changePassword(userId, currentPassword, newPassword) {
  const user = await User.findById(userId).exec();
  if (!user) throw Object.assign(new Error("User not found"), { status: 404 });

  // 1) Verify current password
  const ok = await bcrypt.compare(currentPassword, user.password);
  if (!ok)
    throw Object.assign(new Error("Current password is incorrect"), {
      status: 400,
    });

  // 2) Enforce no-reuse: compare new vs current
  const sameAsCurrent = await bcrypt.compare(newPassword, user.password);
  if (sameAsCurrent) {
    throw Object.assign(new Error("Cannot reuse a recent password"), {
      status: 400,
    });
  }

  // 3) Enforce no-reuse against recent history
  const HISTORY_LIMIT = 5;
  const recentHistory = await PasswordHistory.find({ userId: user._id })
    .sort({ createdAt: -1 })
    .limit(HISTORY_LIMIT)
    .lean()
    .exec();

  for (const h of recentHistory) {
    const match = await bcrypt.compare(newPassword, h.passwordHash);
    if (match) {
      throw Object.assign(new Error("Cannot reuse a recent password"), {
        status: 400,
      });
    }
  }

  // 4) Rotate: store current hash in history, set new hash
  if (user.password) {
    await PasswordHistory.create({
      userId: user._id,
      passwordHash: user.password,
    });
  }

  const SALT_ROUNDS = 10;
  const newHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
  user.password = newHash;
  await user.save();

  // 5) Record new hash in history and prune to limit
  await PasswordHistory.create({ userId: user._id, passwordHash: newHash });

  const idsToKeep = (
    await PasswordHistory.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .limit(HISTORY_LIMIT)
      .select({ _id: 1 })
      .lean()
      .exec()
  ).map((d) => d._id);

  await PasswordHistory.deleteMany({
    userId: user._id,
    _id: { $nin: idsToKeep },
  }).exec();

  // 6) Email confirmation
  const email = buildPasswordChangedEmail();
  await sendMail({ to: user.email, ...email });
}
