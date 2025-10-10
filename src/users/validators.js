import Joi from "joi";
import { EMAIL_RE, PASSWORD_RE, PHONE_IL_RE, URL_RE } from "../common/regex.js";

const nameSchema = Joi.object({
  first: Joi.string().trim().min(2).max(50).required(),
  middle: Joi.string().trim().min(1).max(50).optional().empty(""),
  last: Joi.string().trim().min(2).max(50).required(),
}).required();

const imageSchema = Joi.object({
  url: Joi.string()
    .trim()
    .pattern(URL_RE)
    .message("image.url must be a valid URL")
    .required(),
  alt: Joi.string().trim().min(2).max(100).required(),
}).required();

const addressSchema = Joi.object({
  state: Joi.string().trim().min(2).max(100).optional().empty(""),
  country: Joi.string().trim().min(2).max(100).required(),
  city: Joi.string().trim().min(2).max(100).required(),
  street: Joi.string().trim().min(2).max(120).required(),
  houseNumber: Joi.number().integer().min(1).max(99999).required(),
  zip: Joi.number().integer().min(0).max(9999999).required(),
}).required();

const emailField = Joi.string()
  .trim()
  .pattern(EMAIL_RE)
  .message("email must be a valid address")
  .required();

const phoneField = Joi.string()
  .trim()
  .pattern(PHONE_IL_RE)
  .message("phone must be a valid Israeli phone (e.g., 03-1234567)")
  .required();

const passwordField = Joi.string()
  .pattern(PASSWORD_RE)
  .message(
    "password must be 8–64 chars and include uppercase, lowercase, digit, and special character"
  )
  .required();

//1) Register
export const registerUserSchema = Joi.object({
  name: nameSchema,
  phone: phoneField,
  email: emailField,
  password: passwordField,
  image: imageSchema,
  address: addressSchema,
  isBusiness: Joi.boolean().default(false),
});

//2) Login
export const loginSchema = Joi.object({
  email: emailField,
  password: Joi.string().required(),
});

//3) Update profile (self)
const partialImageSchema = Joi.object({
  url: Joi.string()
    .trim()
    .pattern(URL_RE)
    .message("image.url must be a valid URL")
    .optional()
    .empty(""),
  alt: Joi.string().trim().min(2).max(256).optional().empty(""),
});

const partialAddressSchema = Joi.object({
  country: Joi.string().trim().min(2).max(256).optional().empty(""),
  city: Joi.string().trim().min(2).max(256).optional().empty(""),
  street: Joi.string().trim().min(2).max(256).optional().empty(""),
  houseNumber: Joi.number().integer().min(1).max(99999).optional(),
  zip: Joi.number().integer().min(0).max(9999999).optional(),
  state: Joi.string().trim().min(1).max(256).optional().empty(""),
});

export const updateUserSchema = Joi.object({
  name: nameSchema.optional(),
  phone: Joi.string()
    .trim()
    .pattern(PHONE_IL_RE)
    .message("phone must be a valid Israeli phone (e.g., 03-1234567)")
    .optional()
    .empty(""),
  image: partialImageSchema.optional(),
  address: partialAddressSchema.optional(),
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
  email: emailField,
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
