import { User } from "../models/user.js";
import { PasswordReset } from "../models/passwordReset.js";
import { makeTokenPair } from "../../utils/token.js";
import { appConfig } from "../../config/env.js";
import { sendMail } from "../../utils/mailer.js";
import { buildResetPasswordEmail } from "../../mails/resetPassword.js";

/**
 * Generate a one-time password reset token and email it to the user.
 * - Does NOT reveal whether the email exists (avoid account enumeration).
 * - Replaces any previous reset tokens for that user.
 * - Token is short-lived (default 30 minutes).
 */
const ttlStr = process.env.RESET_TTL_MINUTES ?? "30";
const ttlMinutes = Number(ttlStr) || 30;

export async function forgotPassword(email) {
  if (typeof email !== "string") {
    const err = new Error("email must be a string");
    err.status = 400;
    throw err;
  }

  const normalized = email.trim().toLowerCase();
  const user = await User.findOne({ email: normalized }).lean().exec();

  // Always behave the same whether user exists or not (security hardening)
  if (!user) return;

  // Invalidate previous tokens for this user to keep a single active token
  await PasswordReset.deleteMany({ userId: user._id }).exec();

  // Create raw token (sent to user) + its hash (stored in DB)
  const { raw, hash } = makeTokenPair(32);

  const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000);

  await PasswordReset.create({
    userId: user._id,
    tokenHash: hash,
    expiresAt,
  });

  // Build reset link using APP_BASE_URL from environment
  const base = appConfig.appBaseUrl?.replace(/\/+$/, "") ?? "";
  const link = `${base}/reset-password?token=${encodeURIComponent(raw)}`;

  // Compose and send the email
  const emailContent = buildResetPasswordEmail(normalized, link, ttlMinutes);
  await sendMail({ to: normalized, ...emailContent });
}
