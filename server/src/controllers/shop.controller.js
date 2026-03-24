const { prisma } = require("../db/prisma");
const { HttpError } = require("../utils/http-error");

/** Публічний список товарів (модель CustomizationOption). */
async function getShop(_req, res) {
  const items = await prisma.customizationOption.findMany({
    orderBy: [{ rarity: "asc" }, { price: "asc" }],
  });

  return res.status(200).json({
    success: true,
    data: { items },
  });
}

async function buy(req, res) {
  const { customizationId } = req.body;

  if (!customizationId) {
    throw new HttpError(400, "Потрібне поле customizationId");
  }

  const option = await prisma.customizationOption.findUnique({
    where: { id: customizationId },
  });
  if (!option) {
    throw new HttpError(404, "Товар не знайдено");
  }

  const userId = req.user.id;

  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new HttpError(401, "Користувача не знайдено");
    }
    if (user.candyBalance < option.price) {
      throw new HttpError(400, "Недостатньо цукерок");
    }

    const already = await tx.userCustomization.findUnique({
      where: {
        userId_customizationId: {
          userId,
          customizationId: option.id,
        },
      },
    });
    if (already) {
      throw new HttpError(400, "Цей предмет уже куплено");
    }

    await tx.user.update({
      where: { id: userId },
      data: { candyBalance: { decrement: option.price } },
    });

    await tx.userCustomization.create({
      data: {
        userId,
        customizationId: option.id,
      },
    });

    return tx.user.findUnique({
      where: { id: userId },
      select: { candyBalance: true },
    });
  });

  return res.status(200).json({
    success: true,
    data: {
      message: "Куплено",
      customizationId: option.id,
      candyBalance: result.candyBalance,
    },
  });
}

module.exports = { getShop, buy };
