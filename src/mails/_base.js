/**
 * Shared helpers for email content.
 * Keep this file tiny: layout wrapper + small utilities used by individual emails.
 */
import { appConfig } from "../config/env.js";
const BRAND_NAME = "Card Forge";

/** Minimal shared HTML frame for consistent branding */
export function renderBase(contentHtml) {
  const appUrl = appConfig.appBaseUrl ?? "";
  const year = new Date().getFullYear();
  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="color-scheme" content="light only" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${BRAND_NAME}</title>
  </head>
  <body style="font-family: Arial, sans-serif; line-height:1.6; color:#111; background:#f6f7f9; padding:48px;">
    <table role="presentation" width="640" align="center"  cellspacing="0" cellpadding="0"
           style="max-width:640px; margin:48px auto; background:#fff; border-radius:8px; overflow:hidden; border:1px solid #e5e7eb;">
      <tr>
        <td style="padding:16px 20px; background:#0b5fff; color:#fff; font-weight:600; text-align:center;">
           <a href="${appUrl}" style="font-size: 36px; text-decoration:none; color:#fff !important; target="_blank"">${BRAND_NAME}</a>
        </td>
      </tr>
      <tr>
        <td style="padding:28px 24px;">
          <div style="max-width:520px; margin:0 auto; text-align:center; letter-spacing: -0.5px;font-family: Arial, sans-serif;">  <!-- CENTERED BODY -->
            ${contentHtml}
          </div>
        </td>
      </tr>
      <tr>
        <td style="padding:14px 20px; font-size:12px; color:#666; background:#f2f4f7; text-align:center;">
          © ${year} ${BRAND_NAME}
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

/** Tiny util: wrap a plain link in a short, friendly block */
export function linkBlock(href, text = href) {
  return `<p><a href="${href}" target="_blank" rel="noopener noreferrer" >${text}</a></p>`;
}
