import { Schema, model } from "mongoose";

const PasswordResetSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    tokenHash: { type: String, required: true, index: true, unique: true },
    expiresAt: { type: Date, required: true, index: true },
    usedAt: { type: Date },
  },
  { timestamps: true }
);

// TTL-like behavior: optional background cleanup index on expiresAt
// (Mongo won't auto-delete on expiresAt unless it's a TTL index; you can run this once in migration)
// PasswordResetSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const PasswordReset = model("PasswordReset", PasswordResetSchema);
