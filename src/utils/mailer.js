import nodemailer from "nodemailer";
import { appConfig } from "../config/env.js";

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  const { host, port, user, pass } = appConfig.smtp;
  if (!host || !port || !user || !pass) {
    // No SMTP configured → dev fallback: log to console only.
    return null;
  }

  transporter = nodemailer.createTransport({
    host,
    port,
    secure: Number(port) === 465, // common SMTPS heuristic
    auth: { user, pass },
  });

  return transporter;
}

/**
 * Send any email (generic). Use this from specific mail builders under
 * src/helpers/mails/*.ts after they compose subject/text/html.
 */
export async function sendMail(mail) {
  const t = getTransporter();
  const fromAddress = appConfig.smtp.user;
  const from = mail.fromName
    ? `${mail.fromName} <${fromAddress}>`
    : fromAddress;

  if (!t) {
    // Dev fallback: log instead of sending
    console.log("[mail] (dev) to:", mail.to, "subject:", mail.subject);
    console.log(mail.text ?? mail.html);
    return;
  }

  await t.sendMail({
    from,
    to: mail.to,
    subject: mail.subject,
    text: mail.text,
    html: mail.html,
  });
}
