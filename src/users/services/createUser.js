import { hashPassword } from "../helpers/passwordHelper.js";
import { toPublic } from "../controller.js";
import { User } from "../models/user.js";

export async function createUser(input) {
  // 1) Uniqueness guard
  const exists = await User.findOne({
    email: input.email.toLowerCase(),
  }).lean();

  if (exists) {
    throw Object.assign(new Error("Email already in use"), { status: 409 });
  }

  // 2) Hash password
  const password = await hashPassword(input.password);

  // 3) Persist
  const user = await User.create({
    ...input,
    email: input.email.toLowerCase(),
    password,
  });

  return toPublic(user.toObject());
}
