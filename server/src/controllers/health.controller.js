function getHealth(_req, res) {
  res.status(200).json({
    success: true,
    data: {
      status: "ok",
      service: "game-math-api",
      timestamp: new Date().toISOString(),
    },
  });
}

module.exports = { getHealth };
