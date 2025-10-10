/** Update profile (self).
 * Only allows safe fields;
 * password changes use dedicated function
 * */

import { toPublic } from "../controller.js";
import { User } from "../models/user.js";

export async function updateUserProfile(userId, updates) {
  if ("email" in updates) delete updates.email;

  // Build a $set of ONLY provided fields, using dotted paths for nested objects
  const $set = {};

  if (typeof updates.phone !== "undefined") $set.phone = updates.phone;
  if (typeof updates.isBusiness !== "undefined")
    $set.isBusiness = updates.isBusiness;

  if (updates.name) {
    // name is an all-or-nothing object (per validator); set entire subdoc
    $set.name = updates.name;
  }
  if (updates.image) {
    for (const [k, v] of Object.entries(updates.image)) {
      if (typeof v !== "undefined") $set[`image.${k}`] = v;
    }
  }
  if (updates.address) {
    for (const [k, v] of Object.entries(updates.address)) {
      if (typeof v !== "undefined") $set[`address.${k}`] = v;
    }
  }

  const user = await User.findByIdAndUpdate(
    userId,
    Object.keys($set).length ? { $set } : {}, // no-op if empty
    { new: true, runValidators: true, context: "query" } // context is important
  ).exec();

  return user ? toPublic(user.toObject()) : null;
}
