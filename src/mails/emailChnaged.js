import { renderBase } from "./_base.js";

export function buildEmailChangedEmails(oldEmail, newEmail) {
  // To OLD address (security alert)
  const toOld = {
    subject: "Your account email was changed",
    text:
      `Your account email was changed from ${oldEmail} to ${newEmail}. ` +
      `If you didn't make this change, reset your password immediately and contact support.`,
    html: renderBase(
      `<h2>Email changed</h2>
       <p>Your account email was changed from <strong>${oldEmail}</strong> to <strong>${newEmail}</strong>.</p>
       <p>If you didn’t make this change, reset your password immediately and contact support.</p>`
    ),
    fromName: "Card Forge Security",
  };

  // To NEW address (confirmation)
  const toNew = {
    subject: "Your email change is complete",
    text: `This is a confirmation that your account email is now ${newEmail}.`,
    html: renderBase(
      `<h2>Email change confirmed</h2>
       <p>This is a confirmation that your account email is now <strong>${newEmail}</strong>.</p>
       <p>If this wasn’t you, reset your password and contact support.</p>`
    ),
    fromName: "Card Forge Security",
  };

  return { toOld, toNew };
}
