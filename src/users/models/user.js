import { model, Schema } from "mongoose";
import {
  AddressSchema,
  ImageSchema,
  NameSchema,
  PresenceSchema,
  StatusSchema,
} from "../../common/schemas.js";

const userSchema = new Schema(
  {
    name: { type: NameSchema, required: true },
    phone: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true },
    image: { type: ImageSchema, required: true },
    address: { type: AddressSchema, required: true },
    isBusiness: { type: Boolean, default: false },
    isAdmin: { type: Boolean, default: false },
    status: { type: StatusSchema, default: () => ({}) },
    presence: { type: PresenceSchema, default: () => ({}) },
    failedLoginCount: { type: Number, default: 0 },
    lockUntil: { type: Date, default: null },
  },
  { timestamps: true }
);

export const User = model("User", userSchema);
