export function parsePaging(
  q,
  defaults = { page: 1, limit: 10 },
  maxLimit = 50
) {
  const page = Math.max(1, Number(q?.page) || defaults.page);
  const rawLimit = Number(q?.limit) || defaults.limit;
  const limit = Math.min(Math.max(1, rawLimit), maxLimit);
  const skip = (page - 1) * limit;
  const startIndex = skip + 1;
  return { page, limit, skip, startIndex };
}

/** Convert a sort string (e.g. "-createdAt,email") into a safe object, only for allowed fields */
export function parseSort(q, allowed = []) {
  const s = typeof q?.sort === "string" ? q.sort : undefined;
  if (!s) return undefined;

  const fields = s
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
  const sort = {};

  for (const token of fields) {
    const dir = token.startsWith("-") ? -1 : 1;
    const field = token.startsWith("-") ? token.slice(1) : token;
    if (allowed.includes(token) || allowed.includes(field)) {
      sort[field] = dir;
    }
  }

  return Object.keys(sort).length ? sort : undefined;
}

export function buildMeta(total, paging) {
  const pages = Math.max(1, Math.ceil(total / paging.limit));
  return {
    page: paging.page,
    limit: paging.limit,
    pages,
    total,
    startIndex: paging.startIndex,
  };
}
