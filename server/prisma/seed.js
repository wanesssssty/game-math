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

function skinPrice(index) {
  if (index === 1) return 0;
  if (index <= 8) return 50;
  if (index <= 16) return 100;
  if (index <= 24) return 150;
  return 200;
}

function skinRarity(index) {
  if (index === 1) return "COMMON";
  if (index <= 8) return "COMMON";
  if (index <= 16) return "RARE";
  if (index <= 24) return "RARE";
  return "EPIC";
}

async function main() {
  const cats = [
    {
      name: "Пухнастик",
      rarity: "COMMON",
      imageUrl: "/cats/pipo-nekonin001.png",
    },
    {
      name: "Розумник",
      rarity: "RARE",
      imageUrl: "/cats/pipo-nekonin002.png",
    },
    {
      name: "Зірка",
      rarity: "EPIC",
      imageUrl: "/cats/pipo-nekonin003.png",
    },
  ];

  for (const c of cats) {
    const exists = await prisma.cat.findFirst({ where: { name: c.name } });
    if (!exists) {
      await prisma.cat.create({ data: c });
    }
  }

  for (let i = 1; i <= 32; i += 1) {
    const n = String(i).padStart(3, "0");
    const imageUrl = `/cats/pipo-nekonin${n}.png`;
    const name = `Неконін #${i}`;
    const exists = await prisma.customizationOption.findFirst({
      where: { imageUrl },
    });
    if (!exists) {
      await prisma.customizationOption.create({
        data: {
          name,
          type: "FUR",
          imageUrl,
          price: skinPrice(i),
          rarity: skinRarity(i),
        },
      });
    }
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
