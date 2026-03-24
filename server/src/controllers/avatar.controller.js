const { prisma } = require("../db/prisma");
const { HttpError } = require("../utils/http-error");

/**
 * Оновлення аватара: обраний кіт + екіпіровка по типах (UserCatCustomization).
 * body: { selectedCatId?: uuid, equipped?: [{ customizationId, type }] }
 */
async function updateAvatar(req, res) {
  const { selectedCatId, equipped } = req.body;
  const userId = req.user.id;

  if (!selectedCatId && !Array.isArray(equipped)) {
    throw new HttpError(400, "Передай selectedCatId і/або equipped[]");
  }

  await prisma.$transaction(async (tx) => {
    if (selectedCatId) {
      const cat = await tx.cat.findUnique({ where: { id: selectedCatId } });
      if (!cat) {
        throw new HttpError(404, "Кота не знайдено");
      }
      const unlocked = await tx.userCat.findUnique({
        where: {
          userId_catId: { userId, catId: selectedCatId },
        },
      });
      if (!unlocked) {
        throw new HttpError(403, "Цей кіт ще не розблоковано");
      }
      await tx.user.update({
        where: { id: userId },
        data: { selectedCatId },
      });
    }

    if (Array.isArray(equipped)) {
      for (const row of equipped) {
        const { customizationId, type } = row;
        if (!customizationId || !type) {
          throw new HttpError(400, "У equipped потрібні customizationId та type");
        }

        const owned = await tx.userCustomization.findUnique({
          where: {
            userId_customizationId: { userId, customizationId },
          },
        });
        if (!owned) {
          throw new HttpError(400, "Спочатку купи цю кастомізацію");
        }

        const option = await tx.customizationOption.findUnique({
          where: { id: customizationId },
        });
        if (!option || option.type !== type) {
          throw new HttpError(400, "Тип кастомізації не збігається з предметом");
        }

        await tx.userCatCustomization.upsert({
          where: {
            userId_type: { userId, type },
          },
          create: {
            userId,
            customizationId,
            type,
          },
          update: {
            customizationId,
          },
        });
      }
    }
  });

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      selectedCat: true,
      userCatCustomizations: { include: { customization: true } },
    },
  });

  return res.status(200).json({
    success: true,
    data: {
      selectedCatId: user.selectedCatId,
      selectedCat: user.selectedCat,
      equipped: user.userCatCustomizations,
    },
  });
}

module.exports = { updateAvatar };
