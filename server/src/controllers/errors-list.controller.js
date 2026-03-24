const { prisma } = require("../db/prisma");

/** Журнал помилок для режиму «виправлення». */
async function listErrors(req, res) {
  const take = Math.min(Number(req.query.limit) || 50, 200);

  const errors = await prisma.errorLog.findMany({
    where: { userId: req.user.id },
    orderBy: { createdAt: "desc" },
    take,
  });

  return res.status(200).json({
    success: true,
    data: { errors },
  });
}

module.exports = { listErrors };
