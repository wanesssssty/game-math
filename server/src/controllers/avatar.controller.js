const { prisma } = require("../db/prisma");
const { HttpError } = require("../utils/http-error");

const CUSTOMIZATION_TYPES = ["FUR", "EYES", "ACCESSORY", "BACKGROUND"];

/**
 * Оновлення аватара:
 * - legacy: { selectedCatId?, equipped?: [{ customizationId, type }] }
 * - skin: { skin? } — шлях до PNG (/cats/pipo-nekoninNNN.png), тип FUR
 * - values: { furColor?, eyeColor?, accessory?, background? } (null = зняти слот)
 */
async function updateAvatar(req, res) {
  const { selectedCatId, equipped, skin, furColor, eyeColor, accessory, background } = req.body;
  const userId = req.user.id;

  const hasValuePayload =
    skin !== undefined ||
    furColor !== undefined ||
    eyeColor !== undefined ||
    accessory !== undefined ||
    background !== undefined;

  let equippedRows = Array.isArray(equipped) ? equipped : null;

  if (hasValuePayload) {
    equippedRows = await resolveEquippedFromValues({
      skin,
      furColor,
      eyeColor,
      accessory,
      background,
    });
  }

  if (!selectedCatId && !equippedRows) {
    throw new HttpError(
      400,
      "Передай selectedCatId, equipped[], skin або furColor/eyeColor/accessory/background"
    );
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

    if (equippedRows) {
      for (const row of equippedRows) {
        if (row.remove) {
          await tx.userCatCustomization.deleteMany({
            where: { userId, type: row.type },
          });
          continue;
        }

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

async function resolveEquippedFromValues({ skin, furColor, eyeColor, accessory, background }) {
  const valueSlots = [
    { type: "FUR", value: skin !== undefined ? skin : furColor },
    { type: "EYES", value: eyeColor },
    { type: "ACCESSORY", value: accessory },
    { type: "BACKGROUND", value: background },
  ];

  const rows = [];

  for (const slot of valueSlots) {
    if (slot.value === undefined) continue;

    if (slot.value === null || slot.value === "") {
      rows.push({ type: slot.type, remove: true });
      continue;
    }

    const option = await prisma.customizationOption.findFirst({
      where: {
        type: slot.type,
        imageUrl: String(slot.value),
      },
    });

    if (!option) {
      throw new HttpError(400, `Не знайдено опцію ${slot.type} зі значенням ${slot.value}`);
    }

    rows.push({ customizationId: option.id, type: slot.type });
  }

  return rows;
}

module.exports = { updateAvatar, CUSTOMIZATION_TYPES };
