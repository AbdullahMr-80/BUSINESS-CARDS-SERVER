export function isLocked(user) {
  return !!(user.lockUntil && user.lockUntil > new Date());
}

export function lockUser(user, minutes) {
  const until = new Date(Date.now() + minutes * 60 * 1000);
  user.lockUntil = until;
  user.failedLoginCount = (user.failedLoginCount || 0) + 1;
  return until;
}

export function clearLock(user) {
  user.failedLoginCount = 0;
  user.lockUntil = null;
}
