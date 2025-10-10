import { Schema, model } from "mongoose";
import { ImageSchema, AddressSchema } from "../../common/schemas.js";

// A “business card” owned by a user
const CardSchema = new Schema(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: { type: String, trim: true, required: true, maxlength: 100 },
    subtitle: {
      type: String,
      trim: true,
      required: true,
      maxlength: 120,
    },
    description: {
      type: String,
      trim: true,
      required: true,
      maxlength: 1024,
    },
    phone: { type: String, trim: true, required: true },
    email: { type: String, trim: true, lowercase: true, required: true },
    web: { type: String, trim: true, required: true },
    image: { type: ImageSchema, required: true },
    address: { type: AddressSchema, required: true },
    bizNumber: { type: Number, unique: true, required: true },
    likes: [{ type: Schema.Types.ObjectId, ref: "User", index: true }],
  },
  { timestamps: true }
);

// helpful indexes
CardSchema.index({ owner: 1, createdAt: -1 });
CardSchema.index({ title: "text", subtitle: "text", description: "text" });

export const Card = model("Card", CardSchema);
