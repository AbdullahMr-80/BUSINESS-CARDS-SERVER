import { renderBase } from "./_base.js";

/**
 * Build the "password changed" confirmation email.
 * Usage:
 *   const email = buildPasswordChangedEmail();
 *   await sendMail({ to: user.email, ...email });
 */
export function buildPasswordChangedEmail() {
  const subject = "Your password was changed";
  const text =
    "This is a confirmation that your password was changed. If you didn't do this, contact support immediately.";
  const html = renderBase(
    `<h2>Password changed</h2>
     <p>This is a confirmation that your password was changed.</p>
     <p>If you didn't do this, contact support immediately.</p>`
  );

  return { subject, text, html, fromName: "Card Forge Security" };
}
