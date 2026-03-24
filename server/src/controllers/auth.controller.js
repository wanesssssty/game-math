const { prisma } = require("../db/prisma");
const { HttpError } = require("../utils/http-error");
const { hashPassword, comparePassword } = require("../utils/password");
const { signAuthToken } = require("../utils/jwt");

async function register(req, res) {
  const { email, password, name } = req.body;

  if (!email || typeof email !== "string") {
    throw new HttpError(400, "Поле email обов'язкове");
  }
  if (!password || typeof password !== "string") {
    throw new HttpError(400, "Поле password обов'язкове");
  }
  if (password.length < 6) {
    throw new HttpError(400, "Пароль мінімум 6 символів");
  }

  const normalizedEmail = email.trim().toLowerCase();
  const existing = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });
  if (existing) {
    throw new HttpError(409, "Користувач з таким email вже існує");
  }

  const passwordHash = await hashPassword(password);
  const starterCat = await prisma.cat.findFirst({ orderBy: { name: "asc" } });

  const user = await prisma.$transaction(async (tx) => {
    const u = await tx.user.create({
      data: {
        email: normalizedEmail,
        password: passwordHash,
        name: name && String(name).trim() ? String(name).trim() : null,
        candyBalance: 0,
      },
    });

    if (starterCat) {
      await tx.userCat.upsert({
        where: {
          userId_catId: { userId: u.id, catId: starterCat.id },
        },
        create: {
          userId: u.id,
          catId: starterCat.id,
        },
        update: {},
      });
    }

    return u;
  });

  const token = signAuthToken(user.id, user.email);

  return res.status(201).json({
    success: true,
    data: {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        candyBalance: user.candyBalance,
      },
    },
  });
}

async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new HttpError(400, "email та password обов'язкові");
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (!user || !user.password) {
    throw new HttpError(401, "Невірний email або пароль");
  }

  const ok = await comparePassword(password, user.password);
  if (!ok) {
    throw new HttpError(401, "Невірний email або пароль");
  }

  const token = signAuthToken(user.id, user.email);

  return res.status(200).json({
    success: true,
    data: {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        candyBalance: user.candyBalance,
      },
    },
  });
}

module.exports = { register, login };
