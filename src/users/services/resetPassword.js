import bcrypt from "bcrypt";
import { sha256Hex } from "../../utils/token.js";
import { PASSWORD_RE } from "../../common/regex.js";
import { PasswordReset } from "../models/passwordReset.js";
import { PasswordHistory } from "../models/passwordHistory.js";
import { User } from "../models/user.js";
import { sendMail } from "../../utils/mailer.js";
import { buildPasswordChangedEmail } from "../../mails/passwordChnaged.js";

/**
 * Reset a user's password using a one-time token.
 * - Validates token existence, expiry, and unused state
 * - Enforces password strength (regex) and no-reuse policy
 * - Updates the user's password and records password history
 * - Marks the token as used and sends a confirmation email
 */
export async function resetPassword(rawToken, newPassword) {
  // 1) Basic input checks (service-level guard; route-level Joi should also validate)
  if (!rawToken || typeof rawToken !== "string") {
    throw Object.assign(new Error("Invalid token"), { status: 400 });
  }
  if (!PASSWORD_RE.test(newPassword)) {
    throw Object.assign(
      new Error(
        "Password must be 8–64 chars and include uppercase, lowercase, digit, and special character"
      ),
      { status: 400 }
    );
  }

  // 2) Lookup the token by hash
  const tokenHash = sha256Hex(rawToken);
  const reset = await PasswordReset.findOne({ tokenHash }).exec();
  if (!reset) {
    throw Object.assign(new Error("Invalid or expired token"), { status: 400 });
  }
  if (reset.usedAt) {
    throw Object.assign(new Error("Token already used"), { status: 400 });
  }
  if (reset.expiresAt.getTime() <= Date.now()) {
    throw Object.assign(new Error("Token expired"), { status: 400 });
  }

  // 3) Load the user (with current password hash)
  const user = await User.findById(reset.userId).exec();
  if (!user) {
    // Hard fail but also invalidate token to avoid reuse attempts
    await PasswordReset.updateOne(
      { _id: reset._id },
      { $set: { usedAt: new Date() } }
    );
    throw Object.assign(new Error("User not found"), { status: 404 });
  }

  // 4) Enforce "no password reuse"
  // Compare the new plaintext against the current hash and recent history
  const HISTORY_LIMIT = 10;
  const recentHistory = await PasswordHistory.find({ userId: user._id })
    .sort({ createdAt: -1 })
    .limit(HISTORY_LIMIT)
    .lean()
    .exec();

  // Check against current password
  const sameAsCurrent = await bcrypt.compare(newPassword, user.password);
  if (sameAsCurrent) {
    throw Object.assign(new Error("Cannot reuse a recent password"), {
      status: 400,
    });
  }

  // Check against recent history
  for (const h of recentHistory) {
    const match = await bcrypt.compare(newPassword, h.passwordHash);
    if (match) {
      throw Object.assign(new Error("Cannot reuse a recent password"), {
        status: 400,
      });
    }
  }

  // 5) Rotate password: record current hash into history, then set the new hash
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

  // Also record the new hash to history so future checks include it
  await PasswordHistory.create({
    userId: user._id,
    passwordHash: newHash,
  });

  // Optional pruning: keep only the latest HISTORY_LIMIT entries
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

  // 6) Mark reset token as used
  await PasswordReset.updateOne(
    { _id: reset._id },
    { $set: { usedAt: new Date() } }
  ).exec();

  // 7) Send confirmation email
  const email = buildPasswordChangedEmail();
  await sendMail({ to: user.email, ...email });
}
