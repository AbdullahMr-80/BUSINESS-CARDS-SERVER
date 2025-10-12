import { Card } from "../models/card.js";

/** Remove "", null, undefined recursively. Return undefined for empty objects/arrays. */
function pruneEmpty(value) {
  if (Array.isArray(value)) {
    const arr = value.map(pruneEmpty).filter((v) => v !== undefined);
    return arr.length ? arr : undefined;
  }
  if (value && typeof value === "object") {
    const out = {};
    for (const [k, v] of Object.entries(value)) {
      const cleaned = pruneEmpty(v);
      if (cleaned !== undefined) out[k] = cleaned;
    }
    return Object.keys(out).length ? out : undefined;
  }
  return value === "" || value === null || value === undefined
    ? undefined
    : value;
}

/**
 * Update card fields using dotted $set paths so empty/missing values don't clobber required subfields.
 * Returns updated doc or null if not found/unauthorized.
 */
export async function updateCardFieldsSvc({ cardId, updates, user }) {
  const cleaned = pruneEmpty(updates) ?? {};
  const $set = {};

  // top-level
  for (const key of [
    "title",
    "subtitle",
    "description",
    "phone",
    "email",
    "web",
  ]) {
    if (Object.prototype.hasOwnProperty.call(cleaned, key)) {
      $set[key] = cleaned[key];
    }
  }

  // nested: image
  if (cleaned.image && typeof cleaned.image === "object") {
    for (const [k, v] of Object.entries(cleaned.image)) {
      if (typeof v !== "undefined") $set[`image.${k}`] = v;
    }
  }

  // nested: address
  if (cleaned.address && typeof cleaned.address === "object") {
    for (const [k, v] of Object.entries(cleaned.address)) {
      if (typeof v !== "undefined") $set[`address.${k}`] = v;
    }
  }

  const hasUpdates = Object.keys($set).length > 0;
  const filter = user?.isAdmin
    ? { _id: cardId }
    : { _id: cardId, owner: user?._id };

  const updated = await Card.findOneAndUpdate(
    filter,
    hasUpdates ? { $set } : {},
    { new: true, runValidators: true, context: "query" }
  ).lean();

  return updated;
}
