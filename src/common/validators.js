import Joi from "joi";
import { EMAIL_RE, PASSWORD_RE, PHONE_IL_RE, URL_RE } from "./regex.js";

export const nameSchemaJoi = Joi.object({
  first: Joi.string().trim().min(2).max(50).required(),
  middle: Joi.string().trim().min(1).max(50).optional().empty(""),
  last: Joi.string().trim().min(2).max(50).required(),
}).required();

export const urlSchemaJoi = Joi.string()
  .trim()
  .pattern(URL_RE)
  .required()
  .messages({
    "string.pattern.base": "web url must be a valid URL",
    "string.empty": "web url is required",
  });

export const imageSchemaJoi = Joi.object({
  url: urlSchemaJoi,
  alt: Joi.string().trim().min(2).max(100).required(),
}).required();

export const addressSchemaJoi = Joi.object({
  state: Joi.string().trim().min(2).max(100).optional().empty(""),
  country: Joi.string().trim().min(2).max(100).required(),
  city: Joi.string().trim().min(2).max(100).required(),
  street: Joi.string().trim().min(2).max(120).required(),
  houseNumber: Joi.number().integer().min(1).max(99999).required(),
  zip: Joi.number().integer().min(0).max(9999999).required(),
}).required();

export const emailFieldJoi = Joi.string()
  .trim()
  .pattern(EMAIL_RE)
  .message("email must be a valid address")
  .required();

export const phoneFieldJoi = Joi.string()
  .trim()
  .pattern(PHONE_IL_RE)
  .message("phone must be a valid Israeli phone (e.g., 03-1234567)")
  .required();

export const passwordFieldJoi = Joi.string()
  .pattern(PASSWORD_RE)
  .message(
    "password must be 8–64 chars and include uppercase, lowercase, digit, and special character"
  )
  .required();

// patral for updat fields

export const partialUrlSchemaJoi = Joi.string()
  .trim()
  .pattern(URL_RE)
  .message("image.url must be a valid URL")
  .optional()
  .empty("");

export const partialImageSchemaJoi = Joi.object({
  url: partialUrlSchemaJoi,
  alt: Joi.string().trim().min(2).max(256).optional().empty(""),
});

export const partialAddressSchemajoi = Joi.object({
  country: Joi.string().trim().min(2).max(256).optional().empty(""),
  city: Joi.string().trim().min(2).max(256).optional().empty(""),
  street: Joi.string().trim().min(2).max(256).optional().empty(""),
  houseNumber: Joi.number().integer().min(1).max(99999).optional(),
  zip: Joi.number().integer().min(0).max(9999999).optional(),
  state: Joi.string().trim().min(1).max(256).optional().empty(""),
});

export const partialPhoneFieldJoi = Joi.string()
  .trim()
  .pattern(PHONE_IL_RE)
  .message("phone must be a valid Israeli phone (e.g., 03-1234567)")
  .optional()
  .empty("");

export const partialEmailFieldJoi = Joi.string()
  .trim()
  .pattern(EMAIL_RE)
  .message("email must be a valid address")
  .optional()
  .empty("");
