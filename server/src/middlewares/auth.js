const { prisma } = require("../db/prisma");
const { verifyToken } = require("../utils/jwt");
const { HttpError } = require("../utils/http-error");

/**
 * Перевіряє Authorization: Bearer <JWT>.
 * Після успіху: req.user = { id, email, name, candyBalance }
 */
async function requireAuth(req, _res, next) {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
      throw new HttpError(401, "Потрібен токен (Authorization: Bearer …)");
    }
    const token = header.slice("Bearer ".length).trim();
    if (!token) {
      throw new HttpError(401, "Порожній токен");
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

    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      candyBalance: user.candyBalance,
    };
    next();
  } catch (e) {
    next(e);
  }
}

module.exports = { requireAuth };
