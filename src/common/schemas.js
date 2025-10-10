import { Schema } from "mongoose";

export const NameSchema = new Schema(
  {
    first: { type: String, required: true, trim: true },
    middle: { type: String, trim: true },
    last: { type: String, required: true, trim: true },
  },
  { _id: false }
);

export const AddressSchema = new Schema(
  {
    state: { type: String, trim: true },
    country: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    street: { type: String, required: true, trim: true },
    houseNumber: { type: Number, required: true },
    zip: { type: Number, required: true },
  },
  { _id: false }
);

export const ImageSchema = new Schema(
  {
    url: { type: String, trim: true, required: true },
    alt: { type: String, trim: true, required: true },
  },
  { _id: false }
);

export const StatusSchema = new Schema(
  {
    blocked: { type: Boolean, default: false },
  },
  { _id: false }
);

export const PresenceSchema = new Schema(
  {
    lastSeen: { type: Date },
    isConnected: { type: Boolean, default: false },
  },
  { _id: false }
);
