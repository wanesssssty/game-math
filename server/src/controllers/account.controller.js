const { prisma } = require("../db/prisma");
const { HttpError } = require("../utils/http-error");

async function getAccount(req, res) {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    include: {
      selectedCat: true,
      userCats: {
        include: { cat: true },
        orderBy: { unlockedAt: "asc" },
      },
      userCustomizations: {
        include: { customization: true },
        orderBy: { id: "asc" },
      },
      userCatCustomizations: {
        include: { customization: true },
        orderBy: { type: "asc" },
      },
      progress: {
        orderBy: [{ operationType: "asc" }, { level: "asc" }],
      },
      errorLogs: {
        orderBy: { createdAt: "desc" },
        take: 8,
      },
    },
  });

  if (!user) {
    throw new HttpError(404, "Користувача не знайдено");
  }

  return res.status(200).json({
    success: true,
    data: {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        candyBalance: user.candyBalance,
      },
      selectedCat: user.selectedCat,
      unlockedCats: user.userCats.map((row) => row.cat),
      inventory: user.userCustomizations.map((row) => ({
        id: row.id,
        customizationId: row.customizationId,
        option: row.customization,
      })),
      equipped: user.userCatCustomizations.map((row) => ({
        id: row.id,
        customizationId: row.customizationId,
        type: row.type,
        customization: row.customization,
      })),
      progress: user.progress,
      recentErrors: user.errorLogs,
    },
  });
}

module.exports = { getAccount };
