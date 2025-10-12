import { Card } from "../models/card.js";

export async function listCardsSvc({
  page = 1,
  limit = 10,
  sort = "createdAt",
  search = "",
  viewerId,
}) {
  const filter = {};
  if (search && search.trim()) {
    const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const re = new RegExp(esc(search.trim()), "i");
    filter.$or = [
      { title: re },
      { subtitle: re },
      { description: re },
      { email: re },
      { phone: re },
      { "address.country": re },
      { "address.city": re },
      { "address.street": re },
    ];
  }

  const sortObj =
    sort === "-createdAt"
      ? { createdAt: -1 }
      : sort === "title"
      ? { title: 1 }
      : sort === "-title"
      ? { title: -1 }
      : { createdAt: 1 };

  const pg = Number(page) || 1;
  const lim = Number(limit) || 10;
  const skip = (pg - 1) * lim;

  const [total, docs] = await Promise.all([
    Card.countDocuments(filter).exec(),
    Card.find(filter).sort(sortObj).skip(skip).limit(lim).lean().exec(),
  ]);

  const uid = viewerId && String(viewerId);
  const data = docs.map((c) => ({
    ...c,
    likesCount: c.likes?.length ?? 0,
    likedByMe: uid ? c.likes?.some((u) => String(u) === uid) : false,
  }));

  const pages = Math.max(1, Math.ceil(total / lim));
  return { data, meta: { page: pg, limit: lim, total, pages } };
}
