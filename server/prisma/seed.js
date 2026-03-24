/* eslint-disable no-console */
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const { Pool } = require("pg");
require("dotenv").config();

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not set");
  process.exit(1);
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({
  adapter: new PrismaPg(pool),
});

async function main() {
  const cats = [
    {
      name: "Пухнастик",
      rarity: "COMMON",
      imageUrl: "https://placehold.co/200x200/png?text=Cat+1",
    },
    {
      name: "Розумник",
      rarity: "RARE",
      imageUrl: "https://placehold.co/200x200/png?text=Cat+2",
    },
    {
      name: "Зірка",
      rarity: "EPIC",
      imageUrl: "https://placehold.co/200x200/png?text=Cat+3",
    },
  ];

  for (const c of cats) {
    const exists = await prisma.cat.findFirst({ where: { name: c.name } });
    if (!exists) {
      await prisma.cat.create({ data: c });
    }
  }

  const options = [
    {
      name: "Сіро-блакитна шерсть",
      type: "FUR",
      imageUrl: "https://placehold.co/120x120/png?text=Fur",
      price: 10,
      rarity: "COMMON",
    },
    {
      name: "Яскраві очі",
      type: "EYES",
      imageUrl: "https://placehold.co/120x120/png?text=Eyes",
      price: 15,
      rarity: "COMMON",
    },
    {
      name: "Краватка",
      type: "ACCESSORY",
      imageUrl: "https://placehold.co/120x120/png?text=Tie",
      price: 25,
      rarity: "RARE",
    },
    {
      name: "Космос",
      type: "BACKGROUND",
      imageUrl: "https://placehold.co/120x120/png?text=Bg",
      price: 40,
      rarity: "EPIC",
    },
  ];

  const optCount = await prisma.customizationOption.count();
  if (optCount === 0) {
    await prisma.customizationOption.createMany({ data: options });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
