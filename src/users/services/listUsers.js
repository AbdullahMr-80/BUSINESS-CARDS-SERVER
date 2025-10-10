import { buildMeta, parsePaging, parseSort } from "../../utils/paginate.js";
import { escapeRegExp } from "../helpers/passwordHelper.js";
import { toPublic } from "../controller.js";
import { User } from "../models/user.js";
import { ALLOWED_USER_SORTS } from "../validators.js";
import { getUserSummaries } from "./getUserSummaries.js";

export async function listUsers(query) {
  // 1) Build filter from query

  const asBool = (v) =>
    v === true || v === "true"
      ? true
      : v === false || v === "false"
      ? false
      : undefined;

  const filter = {};

  const isBusiness = asBool(query.isBusiness);
  if (isBusiness !== undefined) filter.isBusiness = isBusiness;

  const isAdmin = asBool(query.isAdmin);
  if (isAdmin !== undefined) filter.isAdmin = isAdmin;

  const blocked = asBool(query.blocked);
  if (blocked !== undefined) filter["status.blocked"] = blocked;

  const connected = asBool(query.connected);
  if (connected !== undefined) filter["presence.isConnected"] = connected;

  // Multi-term search (safe text fields only):
  // - AND across terms
  // - For each term, OR across fields
  // - Fields: name.*, email, phone, address.{country, city, street, state}
  if (query.search && query.search.trim()) {
    const terms = query.search.trim().split(/\s+/).filter(Boolean);

    if (terms.length) {
      const andClauses = terms.map((t) => {
        const re = new RegExp(escapeRegExp(t), "i");
        return {
          $or: [
            { "name.first": re },
            { "name.middle": re },
            { "name.last": re },
            { email: re },
            { phone: re },
            { "address.country": re },
            { "address.city": re },
            { "address.street": re },
            { "address.state": re }, // optional in schema; included if exists
          ],
        };
      });

      if (filter.$and) filter.$and.push(...andClauses);
      else filter.$and = andClauses;
    }
  }

  // 2) Paging + sort
  const paging = parsePaging(query, { page: 1, limit: 10 }, 50);
  const sort = parseSort({ sort: query.sort }, [...ALLOWED_USER_SORTS]);

  // 3) Query DB in parallel
  const [total, docs, summaries] = await Promise.all([
    User.countDocuments(filter).exec(),
    User.find(filter)
      .sort(sort)
      .skip(paging.skip)
      .limit(paging.limit)
      .lean()
      .exec(),
    getUserSummaries(),
  ]);

  // 4) Map to public shape and return meta
  const data = docs.map((d) => toPublic(d));
  const meta = buildMeta(total, paging);

  return { data, meta, summaries };
}
