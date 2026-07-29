-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserProfile" (
    "userId" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "birthYear" INTEGER NOT NULL,
    "heightCm" DOUBLE PRECISION NOT NULL,
    "weightKg" DOUBLE PRECISION NOT NULL,
    "activityLevel" TEXT NOT NULL,
    "goal" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserProfile_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "Nutrient" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "defaultDailyValue" DOUBLE PRECISION NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Nutrient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserNutrientTarget" (
    "userId" TEXT NOT NULL,
    "nutrientId" TEXT NOT NULL,
    "dailyTarget" DOUBLE PRECISION NOT NULL,
    "overridden" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "UserNutrientTarget_pkey" PRIMARY KEY ("userId","nutrientId")
);

-- CreateTable
CREATE TABLE "Food" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "servingSize" DOUBLE PRECISION NOT NULL,
    "servingUnit" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "note" TEXT,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Food_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FoodNutrient" (
    "foodId" TEXT NOT NULL,
    "nutrientId" TEXT NOT NULL,
    "amountPerServing" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "FoodNutrient_pkey" PRIMARY KEY ("foodId","nutrientId")
);

-- CreateTable
CREATE TABLE "MealRecord" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "mealDate" TEXT NOT NULL,
    "mealType" TEXT NOT NULL,
    "imageId" TEXT,
    "source" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MealRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MealRecordItem" (
    "id" TEXT NOT NULL,
    "mealRecordId" TEXT NOT NULL,
    "itemName" TEXT NOT NULL,
    "foodId" TEXT,
    "quantity" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "nutrientSnapshot" TEXT NOT NULL,
    "estimatedByAI" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "MealRecordItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UploadedImage" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UploadedImage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Session_token_key" ON "Session"("token");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Nutrient_key_key" ON "Nutrient"("key");

-- CreateIndex
CREATE INDEX "MealRecord_userId_mealDate_idx" ON "MealRecord"("userId", "mealDate");

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserProfile" ADD CONSTRAINT "UserProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserNutrientTarget" ADD CONSTRAINT "UserNutrientTarget_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserNutrientTarget" ADD CONSTRAINT "UserNutrientTarget_nutrientId_fkey" FOREIGN KEY ("nutrientId") REFERENCES "Nutrient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Food" ADD CONSTRAINT "Food_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FoodNutrient" ADD CONSTRAINT "FoodNutrient_foodId_fkey" FOREIGN KEY ("foodId") REFERENCES "Food"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FoodNutrient" ADD CONSTRAINT "FoodNutrient_nutrientId_fkey" FOREIGN KEY ("nutrientId") REFERENCES "Nutrient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MealRecord" ADD CONSTRAINT "MealRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MealRecord" ADD CONSTRAINT "MealRecord_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "UploadedImage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MealRecordItem" ADD CONSTRAINT "MealRecordItem_mealRecordId_fkey" FOREIGN KEY ("mealRecordId") REFERENCES "MealRecord"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MealRecordItem" ADD CONSTRAINT "MealRecordItem_foodId_fkey" FOREIGN KEY ("foodId") REFERENCES "Food"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UploadedImage" ADD CONSTRAINT "UploadedImage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
