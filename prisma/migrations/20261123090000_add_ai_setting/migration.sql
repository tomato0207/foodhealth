-- CreateTable
CREATE TABLE "AiSetting" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "provider" TEXT,
    "lmstudioBaseUrl" TEXT,
    "lmstudioApiKey" TEXT,
    "lmstudioModel" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AiSetting_pkey" PRIMARY KEY ("id")
);
