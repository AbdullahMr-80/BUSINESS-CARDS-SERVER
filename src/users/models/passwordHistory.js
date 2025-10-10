import { model, Schema } from "mongoose";

/**
 * PasswordHistory keeps a hashed copy of old passwords so we can
 * prevent reusing them.
 *
 * - Store only bcrypt hashes (never plaintext).
 * - On password change, check new hash against N recent hashes.
 * - Typically keep the last 3–5 passwords per user.
 */

const PasswordHistorySchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    passwordHash: { type: String, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// Optionally, you can index userId+createdAt to query recent history fast
PasswordHistorySchema.index({ userId: 1, createdAt: -1 });

export const PasswordHistory = model("PasswordHistory", PasswordHistorySchema);
