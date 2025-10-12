import Joi from "joi";
import { EMAIL_RE, PASSWORD_RE } from "../common/regex.js";
import {
  addressSchemaJoi,
  emailFieldJoi,
  imageSchemaJoi,
  nameSchemaJoi,
  partialAddressSchemajoi,
  partialImageSchemaJoi,
  partialPhoneFieldJoi,
  passwordFieldJoi,
  phoneFieldJoi,
} from "../common/validators.js";

//1) Register
export const registerUserSchema = Joi.object({
  name: nameSchemaJoi,
  phone: phoneFieldJoi,
  email: emailFieldJoi,
  password: passwordFieldJoi,
  image: imageSchemaJoi,
  address: addressSchemaJoi,
  isBusiness: Joi.boolean().default(false),
});

//2) Login
export const loginSchema = Joi.object({
  email: emailFieldJoi,
  password: Joi.string().required(),
});

export const updateUserSchema = Joi.object({
  name: nameSchemaJoi.optional(),
  phone: partialPhoneFieldJoi,
  image: partialImageSchemaJoi.optional(),
  address: partialAddressSchemajoi.optional(),
  isBusiness: Joi.boolean().optional(),
}).min(1);

// 4) Change email (self)
export const changeEmailSchema = Joi.object({
  newEmail: Joi.string()
    .trim()
    .pattern(EMAIL_RE)
    .message("newEmail must be a valid address")
    .required(),
  currentPassword: Joi.string().required(),
});

// 5) Change password (self)
export const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string()
    .pattern(PASSWORD_RE)
    .message(
      "newPassword must be 8–64 chars and include uppercase, lowercase, digit, and special character"
    )
    .required(),
});

// 6) Forgot password
export const forgotPasswordSchema = Joi.object({
  email: emailFieldJoi,
});

// 7) Reset password (via emailed token)
export const resetPasswordSchema = Joi.object({
  token: Joi.string().trim().min(20).required(),
  newPassword: Joi.string()
    .pattern(PASSWORD_RE)
    .message(
      "newPassword must be 8–64 chars and include uppercase, lowercase, digit, and special character"
    )
    .required(),
});

export const blockToggleSchema = Joi.object({
  blocked: Joi.boolean().required(),
});

export const presenceToggleSchema = Joi.object({
  isConnected: Joi.boolean().required(),
});

export const listUsersQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(50).default(10),
  search: Joi.string().trim().optional().allow(""),
  isBusiness: Joi.boolean().optional(),
  isAdmin: Joi.boolean().optional(),
  blocked: Joi.boolean().optional(),
  connected: Joi.boolean().optional(),
  sort: Joi.string().trim().optional(),
}).unknown(false);

export const ALLOWED_USER_SORTS = [
  "createdAt",
  "-createdAt",
  "updatedAt",
  "-updatedAt",
  "email",
  "-email",
  "name.first",
  "-name.first",
  "name.last",
  "-name.last",
  "phone",
  "-phone",
  "isBusiness",
  "-isBusiness",
  "isAdmin",
  "-isAdmin",
  "status.blocked",
  "-status.blocked",
  "presence.isConnected",
  "-presence.isConnected",
];
