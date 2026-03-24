const { prisma } = require("../db/prisma");

/** Інвентар = куплені кастомізації (UserCustomization + деталі опції). */
async function getInventory(req, res) {
  const rows = await prisma.userCustomization.findMany({
    where: { userId: req.user.id },
    include: { customization: true },
    orderBy: { id: "asc" },
  });

  return res.status(200).json({
    success: true,
    data: {
      items: rows.map((r) => ({
        id: r.id,
        customizationId: r.customizationId,
        option: r.customization,
      })),
    },
  });
}

module.exports = { getInventory };
