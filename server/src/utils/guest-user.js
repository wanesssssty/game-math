const { prisma } = require("../db/prisma");

function guestEmailFromDisplayName(displayName) {
  const base = String(displayName || "player")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  const slug = base.length > 0 ? base : "player";
  return `guest.${slug}@mathpaws.local`;
}

async function findOrCreateGuestUser(displayName) {
  const name = String(displayName || "guest").trim().slice(0, 64) || "guest";
  const email = guestEmailFromDisplayName(name);

  return prisma.user.upsert({
    where: { email },
    create: {
      email,
      name,
      password: null,
    },
    update: {
      name,
    },
  });
}

module.exports = { guestEmailFromDisplayName, findOrCreateGuestUser };
