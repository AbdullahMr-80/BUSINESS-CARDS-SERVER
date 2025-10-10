import { renderBase, linkBlock } from "./_base.js";

/**
 * Build the "reset your password" email.
 * Usage:
 *   const email = buildResetPasswordEmail(user.email, resetLink);
 *   await sendMail({ to: user.email, ...email });
 */
export function buildResetPasswordEmail(to, link, ttlMinutes) {
  const subject = "Reset your password";
  const text = `Click the link to reset your password (expires in ${ttlMinutes} minutes): ${link}`;
  const html = renderBase(
    `<h2 style="margin-bottom:8px;">Reset your password</h2>
       <p>We received a request to reset your password. If you made this request, use the button below. This link expires in <strong>${ttlMinutes} minutes</strong>.</p>
       ${linkBlock(link, "Reset password")}
       <p style="color:#555;">If you didn’t request this, you can safely ignore this email.</p>`
  );
  return { subject, text, html, fromName: "Card Forge Security" };
}
