import { renderBase } from "./_base.js";

export function buildWelcomeEmail(name) {
  const subject = "Welcome to Card Forge";
  const greeting = name?.first ? `Hi ${name.first},` : "Hi,";
  const text = `${greeting} welcome to Card Forge! Your account was created successfully.`;
  const html = renderBase(
    `<h2>Welcome to Card Forge</h2>
     <p>${greeting} welcome to <strong>Card Forge</strong>! Your account was created successfully.</p>
     <p>You're all set — sign in anytime to manage your cards.</p>`
  );
  return { subject, text, html, fromName: "Card Forge" };
}
