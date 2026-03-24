-- Drop legacy tables (Child / ProgressSession)
DROP TABLE IF EXISTS "ProgressSession";
DROP TABLE IF EXISTS "Child";

-- CreateEnum
CREATE TYPE "Rarity" AS ENUM ('COMMON', 'RARE', 'EPIC', 'LEGENDARY');

CREATE TYPE "OperationType" AS ENUM ('ADD', 'SUB', 'MUL', 'DIV');

CREATE TYPE "CustomizationType" AS ENUM ('FUR', 'EYES', 'ACCESSORY', 'BACKGROUND');

-- CreateTable
CREATE TABLE "Cat" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "rarity" "Rarity" NOT NULL,
    "imageUrl" TEXT NOT NULL,

    CONSTRAINT "Cat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "name" TEXT,
    "candyBalance" INTEGER NOT NULL DEFAULT 0,
    "selectedCatId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserCat" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "catId" UUID NOT NULL,
    "unlockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserCat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomizationOption" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "type" "CustomizationType" NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "rarity" "Rarity" NOT NULL,

    CONSTRAINT "CustomizationOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserCustomization" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "customizationId" UUID NOT NULL,

    CONSTRAINT "UserCustomization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserCatCustomization" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "customizationId" UUID NOT NULL,
    "type" "CustomizationType" NOT NULL,

    CONSTRAINT "UserCatCustomization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Progress" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "operationType" "OperationType" NOT NULL,
    "level" INTEGER NOT NULL,
    "highScore" INTEGER NOT NULL DEFAULT 0,
    "bestStreak" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GameSession" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "operationType" "OperationType" NOT NULL,
    "level" INTEGER NOT NULL,
    "score" INTEGER NOT NULL,
    "correctAnswers" INTEGER NOT NULL,
    "wrongAnswers" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GameSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ErrorLog" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "operationType" "OperationType" NOT NULL,
    "number1" INTEGER NOT NULL,
    "number2" INTEGER NOT NULL,
    "correctAnswer" INTEGER NOT NULL,
    "userAnswer" INTEGER NOT NULL,
    "attempts" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ErrorLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "UserCat_userId_catId_key" ON "UserCat"("userId", "catId");

-- CreateIndex
CREATE UNIQUE INDEX "UserCustomization_userId_customizationId_key" ON "UserCustomization"("userId", "customizationId");

-- CreateIndex
CREATE UNIQUE INDEX "UserCatCustomization_userId_type_key" ON "UserCatCustomization"("userId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "Progress_userId_operationType_level_key" ON "Progress"("userId", "operationType", "level");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_selectedCatId_fkey" FOREIGN KEY ("selectedCatId") REFERENCES "Cat"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "UserCat" ADD CONSTRAINT "UserCat_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "UserCat" ADD CONSTRAINT "UserCat_catId_fkey" FOREIGN KEY ("catId") REFERENCES "Cat"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "UserCustomization" ADD CONSTRAINT "UserCustomization_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "UserCustomization" ADD CONSTRAINT "UserCustomization_customizationId_fkey" FOREIGN KEY ("customizationId") REFERENCES "CustomizationOption"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "UserCatCustomization" ADD CONSTRAINT "UserCatCustomization_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "UserCatCustomization" ADD CONSTRAINT "UserCatCustomization_customizationId_fkey" FOREIGN KEY ("customizationId") REFERENCES "CustomizationOption"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Progress" ADD CONSTRAINT "Progress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "GameSession" ADD CONSTRAINT "GameSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ErrorLog" ADD CONSTRAINT "ErrorLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
