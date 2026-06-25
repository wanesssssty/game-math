const { prisma } = require("../db/prisma");
const { verifyToken } = require("../utils/jwt");
const { HttpError } = require("../utils/http-error");
const { findOrCreateGuestUser } = require("../utils/guest-user");

function toRequestUser(user) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    candyBalance: user.candyBalance,
  };
}

async function loadUserFromBearer(req) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return null;
  }

  const token = header.slice("Bearer ".length).trim();
  if (!token) {
    return null;
  }

  let decoded;
  try {
    decoded = verifyToken(token);
  } catch {
    throw new HttpError(401, "Невірний або прострочений токен");
  }

  if (decoded.kind !== "auth" || !decoded.sub) {
    throw new HttpError(401, "Це не токен входу");
  }

  const user = await prisma.user.findUnique({
    where: { id: decoded.sub },
  });
  if (!user) {
    throw new HttpError(401, "Користувача не знайдено");
  }

  return user;
}

/**
 * Перевіряє Authorization: Bearer <JWT>.
 * Після успіху: req.user = { id, email, name, candyBalance }
 */
async function requireAuth(req, _res, next) {
  try {
    const user = await loadUserFromBearer(req);
    if (!user) {
      throw new HttpError(401, "Потрібен токен (Authorization: Bearer …)");
    }

    req.user = toRequestUser(user);
    req.isGuest = false;
    next();
  } catch (e) {
    next(e);
  }
}

/**
 * JWT або гість через X-Guest-Name.
 * Дозволяє проходити задачі без входу в акаунт.
 */
async function resolveUser(req, _res, next) {
  try {
    const user = await loadUserFromBearer(req);
    if (user) {
      req.user = toRequestUser(user);
      req.isGuest = false;
      return next();
    }

    const rawGuestName = req.headers["x-guest-name"];
    let displayName = "guest";

    if (typeof rawGuestName === "string" && rawGuestName.trim()) {
      try {
        displayName = decodeURIComponent(rawGuestName.trim()).slice(0, 64) || "guest";
      } catch {
        displayName = rawGuestName.trim().slice(0, 64) || "guest";
      }
    }

    const guestUser = await findOrCreateGuestUser(displayName);

    req.user = toRequestUser(guestUser);
    req.isGuest = true;
    next();
  } catch (e) {
    next(e);
  }
}

module.exports = { requireAuth, resolveUser };
