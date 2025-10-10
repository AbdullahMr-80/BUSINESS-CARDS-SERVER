import Joi from "joi";
import { URL_RE, PHONE_IL_RE, EMAIL_RE } from "../common/regex.js";

// createCardSchema — for POST /cards
export const createCardSchema = Joi.object({
  title: Joi.string().trim().min(2).max(100).required(),
  subtitle: Joi.string().trim().max(120).required(),
  description: Joi.string().trim().max(1024).required(),
  phone: Joi.string().trim().pattern(PHONE_IL_RE).required(),
  email: Joi.string().trim().pattern(EMAIL_RE).required(),
  web: Joi.string().trim().pattern(URL_RE).required(),

  image: Joi.object({
    url: Joi.string().trim().pattern(URL_RE).required(),
    alt: Joi.string().trim().min(2).max(100).required(),
  }).required(),

  address: Joi.object({
    state: Joi.string().trim().min(2).max(100).optional(),
    country: Joi.string().trim().min(2).max(100).required(),
    city: Joi.string().trim().min(2).max(100).required(),
    street: Joi.string().trim().min(2).max(120).required(),
    houseNumber: Joi.number().integer().min(1).max(99999).required(),
    zip: Joi.number().integer().min(0).max(9999999).required(),
  }).required(),
});

// updateCardSchema — for PATCH /cards/:id
export const updateCardSchema = Joi.object({
  title: Joi.string().trim().min(2).max(100).optional(),
  subtitle: Joi.string().trim().max(120).allow(""),
  description: Joi.string().trim().max(1024).allow(""),
  phone: Joi.string().trim().pattern(PHONE_IL_RE).optional(),
  email: Joi.string().trim().pattern(EMAIL_RE).optional(),
  web: Joi.string().trim().pattern(URL_RE).allow("").optional(),

  image: Joi.object({
    url: Joi.string().trim().pattern(URL_RE).optional(),
    alt: Joi.string().trim().min(2).max(100).optional(),
  }).optional(),

  address: Joi.object({
    country: Joi.string().trim().min(2).max(100).optional(),
    city: Joi.string().trim().min(2).max(100).optional(),
    street: Joi.string().trim().min(2).max(120).optional(),
    houseNumber: Joi.number().integer().min(1).max(99999).optional(),
    zip: Joi.number().integer().min(0).max(9999999).optional(),
  }).optional(),
}).min(1);

// listCardsQuerySchema — for GET /cards?search=&page=&limit=
export const listCardsQuerySchema = Joi.object({
  search: Joi.string().trim().allow(""),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(50).default(10),
  sort: Joi.string().valid("createdAt", "-createdAt", "title", "-title"),
}).unknown(false);
