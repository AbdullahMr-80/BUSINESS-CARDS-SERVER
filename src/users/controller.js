import { buildWelcomeEmail } from "../mails/welcome.js";
import { signAuthToken } from "../utils/jwt.js";
import { sendMail } from "../utils/mailer.js";
import { verifyCredentials } from "./helpers/verifyCredentials.js";
import { changeEmail } from "./services/changeEmail.js";
import { changePassword } from "./services/changePassword.js";
import { createUser } from "./services/createUser.js";
import { getUserByIdPublic } from "./services/getUserByIdPublic.js";
import { setPresenceConnected } from "./services/setPresenceConnected.js";
import { setUserBlocked } from "./services/setUserBlocked.js";
import { updateUserProfile } from "./services/updateUserProfile.js";
import { forgotPassword as forgotPasswordSvc } from "./services/forgotPassword.js";
import { resetPassword as resetPasswordSvc } from "./services/resetPassword.js";
import { User } from "./models/user.js";
import { listUsers } from "./services/listUsers.js";
import { clearLock, isLocked, lockUser } from "./helpers/lock.js";
import { minutesToHM } from "./helpers/minutesToHM.js";

export function toPublic(u) {
  const {
    _id,
    name,
    phone,
    email,
    image,
    address,
    isBusiness,
    isAdmin,
    status,
    presence,
    createdAt,
    updatedAt,
  } = u;

  return {
    _id,
    name,
    phone,
    email,
    image,
    address,
    isBusiness,
    isAdmin,
    status,
    presence,
    createdAt,
    updatedAt,
  };
}

export const register = async (req, res) => {
  const user = await createUser(req.body);
  // NEW: fire-and-forget welcome email (non-blocking UX)
  try {
    const email = buildWelcomeEmail(user.name);
    void sendMail({ to: user.email, ...email });
  } catch {
    /* empty */
  }
  res.status(201).json(user);
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  // Policy: default = lock after 1 failure for 24h (configurable)
  const THRESHOLD = Number(process.env.LOGIN_FAIL_THRESHOLD ?? 1);
  const LOCK_MIN = Number(process.env.LOGIN_FAIL_LOCK_MINUTES ?? 1440);

  const normalizedEmail = String(email ?? "")
    .trim()
    .toLowerCase();

  // Load user (we need the doc to update counters even on failure)
  const user = await User.findOne({ email: normalizedEmail }).exec();

  // If user exists and is locked → block early (don’t reveal existence)
  if (user && isLocked(user)) {
    const minutesLeft = Math.max(
      1,
      Math.ceil((user.lockUntil.getTime() - Date.now()) / (60 * 1000))
    );
    throw Object.assign(
      new Error(`Account locked. Try again in ${minutesToHM(minutesLeft)}`),
      { status: 403 }
    );
  }

  // Use your existing helper, which returns the user or null
  const verified = await verifyCredentials(normalizedEmail, password);

  if (!verified) {
    // Increment counters only if user exists (avoid user enumeration hints)
    if (user) {
      user.failedLoginCount = (user.failedLoginCount || 0) + 1;
      if (user.failedLoginCount >= THRESHOLD) {
        lockUser(user, LOCK_MIN);
      }
      await user.save();
    }
    throw Object.assign(new Error("Invalid email or password"), {
      status: 401,
    });
  }

  // Success → clear any lock state
  if (user && (user.failedLoginCount || user.lockUntil)) {
    clearLock(user);
    await user.save();
  }

  if (verified.status?.blocked) {
    throw Object.assign(new Error("Account is blocked"), { status: 403 });
  }

  const token = signAuthToken({
    _id: String(verified._id),
    isBusiness: !!verified.isBusiness,
    isAdmin: !!verified.isAdmin,
  });

  res.json({ token, user: toPublic(verified) });
};

// Admin: list users with paging/search/filters/sort + summaries
export const list = async (req, res) => {
  const result = await listUsers(req.validatedQuery ?? req.query);
  res.json(result);
};

// Self or Admin: get single user by id
export const getById = async (req, res) => {
  const id = req.params.id;
  const user = await getUserByIdPublic(id);
  if (!user) throw Object.assign(new Error("User not found"), { status: 404 });
  res.json(user);
};

// Self only: update profile
export const updateProfile = async (req, res) => {
  const id = req.params.id;

  //prevent an admin from updating another admin's profile
  if (String(req.user?._id) !== id) {
    const target = await User.findById(id).select({ isAdmin: 1 }).lean().exec();
    if (!target) {
      throw Object.assign(new Error("User not found"), { status: 404 });
    }
    if (target.isAdmin) {
      throw Object.assign(
        new Error("Admin cannot update another admin's profile"),
        { status: 403 }
      );
    }
  }

  const updated = await updateUserProfile(id, req.body);
  if (!updated)
    throw Object.assign(new Error("User not found"), { status: 404 });
  res.json(updated);
};

// Admin: block/unblock user
export const setBlocked = async (req, res) => {
  const id = req.params.id;
  const { blocked } = req.body;

  if (String(req.user?._id) === id) {
    throw Object.assign(new Error("Admin cannot block themselves"), {
      status: 400,
    });
  }
  // prevent admin from blocking/unblocking another admin
  const target = await User.findById(id).select({ isAdmin: 1 }).lean().exec();
  if (!target)
    throw Object.assign(new Error("User not found"), { status: 404 });
  if (target.isAdmin) {
    throw Object.assign(
      new Error("Admin cannot change another admin's block status"),
      { status: 403 }
    );
  }

  const updated = await setUserBlocked(id, blocked);
  res.json(updated);
};

// Admin: connect/disconnect user presence
export const setPresence = async (req, res) => {
  const id = req.params.id;
  const { isConnected } = req.body;
  // prevent admin from toggling another admin's presence
  const target = await User.findById(id).select({ isAdmin: 1 }).lean().exec();
  if (!target)
    throw Object.assign(new Error("User not found"), { status: 404 });
  if (target.isAdmin) {
    throw Object.assign(
      new Error("Admin cannot change another admin's presence"),
      { status: 403 }
    );
  }

  await setPresenceConnected(id, isConnected);
  res.json({ _id: id, presence: { isConnected, lastSeen: new Date() } });
};

// Self or Admin: change email (requires current password)
export const updateEmail = async (req, res) => {
  const id = req.params.id;
  const { currentPassword, newEmail } = req.body;
  //prevent admin from changing another admin's email
  if (String(req.user?._id) !== id) {
    const target = await User.findById(id).select({ isAdmin: 1 }).lean().exec();
    if (!target)
      throw Object.assign(new Error("User not found"), { status: 404 });
    if (target.isAdmin) {
      throw Object.assign(
        new Error("Admin cannot change another admin's email"),
        { status: 403 }
      );
    }
  }

  const updated = await changeEmail(id, currentPassword, newEmail);
  res.json(updated);
};

// Self or Admin: change password (requires current password)
export const updatePassword = async (req, res) => {
  const id = req.params.id;
  const { currentPassword, newPassword } = req.body;
  //prevent admin from changing another admin's password
  if (String(req.user?._id) !== id) {
    const target = await User.findById(id).select({ isAdmin: 1 }).lean().exec();
    if (!target)
      throw Object.assign(new Error("User not found"), { status: 404 });
    if (target.isAdmin) {
      throw Object.assign(
        new Error("Admin cannot change another admin's password"),
        { status: 403 }
      );
    }
  }

  await changePassword(id, currentPassword, newPassword);
  res.status(204).send();
};

// Public: start forgot-password flow (email with reset link)
export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  await forgotPasswordSvc(email); // intentionally silent even if email not found
  res.status(204).send();
};

// Public: complete reset with token + new password
export const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;
  await resetPasswordSvc(token, newPassword);
  res.status(204).send();
};
