import Joi from "joi";
import {
  addressSchemaJoi,
  emailFieldJoi,
  imageSchemaJoi,
  partialAddressSchemajoi,
  partialEmailFieldJoi,
  partialImageSchemaJoi,
  partialPhoneFieldJoi,
  partialUrlSchemaJoi,
  phoneFieldJoi,
  urlSchemaJoi,
} from "../common/validators.js";

// createCardSchema — for POST /cards
export const createCardSchema = Joi.object({
  title: Joi.string().trim().min(2).max(100).required(),
  subtitle: Joi.string().trim().min(10).max(120).required(),
  description: Joi.string().trim().min(48).max(1024).required(),
  phone: phoneFieldJoi,
  email: emailFieldJoi,
  web: urlSchemaJoi,
  image: imageSchemaJoi,
  address: addressSchemaJoi,
});

// updateCardSchema — for PATCH /cards/:id
export const updateCardSchema = Joi.object({
  title: Joi.string().trim().min(2).max(100).optional().allow(""),
  subtitle: Joi.string().trim().min(10).max(120).optional().allow(""),
  description: Joi.string().trim().min(48).max(1024).optional().allow(""),
  phone: partialPhoneFieldJoi,
  email: partialEmailFieldJoi,
  web: partialUrlSchemaJoi,
  image: partialImageSchemaJoi,
  address: partialAddressSchemajoi,
}).min(1);

// listCardsQuerySchema — for GET /cards?search=&page=&limit=
export const listCardsQuerySchema = Joi.object({
  search: Joi.string().trim().allow(""),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(50).default(10),
  sort: Joi.string().valid("createdAt", "-createdAt", "title", "-title"),
}).unknown(false);
