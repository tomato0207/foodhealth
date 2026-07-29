
-- AlterTable
ALTER TABLE "Food" ADD COLUMN     "sourceCode" TEXT;

-- AlterTable
ALTER TABLE "Nutrient" ADD COLUMN     "trackable" BOOLEAN NOT NULL DEFAULT true;

-- CreateIndex
CREATE UNIQUE INDEX "Food_sourceCode_key" ON "Food"("sourceCode");

