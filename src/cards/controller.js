import { generateBizNumber } from "./helpers/generateBizNumber.js";
import { Card } from "./models/card.js";
import { createCardDoc } from "./services/createCardDoc.js";

//Create a new card (business or admin only)
export const createCard = async (req, res) => {
  const card = await createCardDoc({ ownerId: req.user._id, input: req.body });
  res.status(201).json(card);
};

export const getCardById = async (req, res) => {
  const card = await Card.findById(req.params.id).lean().exec();
  if (!card) {
    throw Object.assign(new Error("Card not found"), { status: 404 });
  }
  const uid = req.user?._id && String(req.user._id);
  res.json({
    ...card,
    likesCount: card.likes?.length ?? 0,
    likedByMe: uid ? card.likes?.some((u) => String(u) === uid) : false,
  });
};

export const getCardByBiz = async (req, res) => {
  const card = await Card.findOne({ bizNumber: Number(req.params.bizNumber) })
    .lean()
    .exec();
  if (!card) throw Object.assign(new Error("Card not found"), { status: 404 });
  const uid = req.user?._id && String(req.user._id);
  res.json({
    ...card,
    likesCount: card.likes?.length ?? 0,
    likedByMe: uid ? card.likes?.some((u) => String(u) === uid) : false,
  });
};

//Get all public cards (anyone can access)
export const listCards = async (req, res) => {
  const {
    page = 1,
    limit = 10,
    sort = "createdAt",
    search = "",
  } = req.validatedQuery ?? req.query;

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

  const uid = req.user?._id && String(req.user._id);
  const data = docs.map((c) => ({
    ...c,
    likesCount: c.likes?.length ?? 0,
    likedByMe: uid ? c.likes?.some((u) => String(u) === uid) : false,
  }));

  const pages = Math.max(1, Math.ceil(total / lim));
  res.json({ data, meta: { page: pg, limit: lim, total, pages } });
};

// Get cards created by current user
export const listMyCards = async (req, res) => {
  const uid = String(req.user._id);
  const cards = await Card.find({ owner: req.user._id }).lean().exec();
  res.json(
    cards.map((c) => ({
      ...c,
      likesCount: c.likes?.length ?? 0,
      likedByMe: c.likes?.some((u) => String(u) === uid) || false,
    }))
  );
};

// Update a card (owner or admin)
export const updateCard = async (req, res) => {
  const { id } = req.params;
  const filter = req.user.isAdmin
    ? { _id: id }
    : { _id: id, owner: req.user._id };

  const updated = await Card.findOneAndUpdate(filter, req.body, {
    new: true,
    runValidators: true,
  }).lean();

  if (!updated) {
    throw Object.assign(new Error("Card not found or not authorized"), {
      status: 404,
    });
  }

  res.json(updated);
};

// Delete a card (owner or admin)
export const deleteCard = async (req, res) => {
  const { id } = req.params;
  const filter = req.user.isAdmin
    ? { _id: id }
    : { _id: id, owner: req.user._id };

  const deleted = await Card.findOneAndDelete(filter).lean();

  if (!deleted) {
    throw Object.assign(new Error("Card not found or not authorized"), {
      status: 404,
    });
  }

  res.status(204).send();
};

// Like / Unlike toggle
export const toggleLike = async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  const card = await Card.findById(id).exec();
  if (!card) throw Object.assign(new Error("Card not found"), { status: 404 });

  const hasLiked = card.likes.some((u) => u.equals(userId));

  if (hasLiked) {
    card.likes.pull(userId);
  } else {
    card.likes.push(userId);
  }

  await card.save();

  res.json({
    _id: card._id,
    liked: !hasLiked,
    likesCount: card.likes.length,
  });
};

export const setNewBizNumber = async (req, res) => {
  const { id } = req.params;

  // allow client to pass a specific number, or auto-generate
  const incoming = req.body?.bizNumber;
  let bizNumber = Number(incoming);

  if (!incoming) {
    bizNumber = await generateBizNumber();
  } else {
    if (
      !Number.isInteger(bizNumber) ||
      bizNumber < 100000 ||
      bizNumber > 999999
    ) {
      throw Object.assign(new Error("bizNumber must be a 6-digit integer"), {
        status: 400,
      });
    }
    // ensure uniqueness
    const exists = await Card.exists({ bizNumber }).lean();
    if (exists) {
      throw Object.assign(new Error("bizNumber already in use"), {
        status: 409,
      });
    }
  }

  const updated = await Card.findByIdAndUpdate(
    id,
    { $set: { bizNumber } },
    { new: true, runValidators: true }
  ).lean();

  if (!updated)
    throw Object.assign(new Error("Card not found"), { status: 404 });

  res.json({ _id: updated._id, bizNumber: updated.bizNumber });
};
