import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { TFND_NUTRIENTS } from "./tfnd-nutrients";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log(`Seeding ${TFND_NUTRIENTS.length} nutrients (from TFND mapping table)...`);
  for (const nutrient of TFND_NUTRIENTS) {
    await prisma.nutrient.upsert({
      where: { key: nutrient.key },
      update: {
        name: nutrient.name,
        unit: nutrient.unit,
        category: nutrient.category,
        defaultDailyValue: nutrient.defaultDailyValue,
        sortOrder: nutrient.sortOrder,
        trackable: nutrient.trackable,
      },
      create: {
        key: nutrient.key,
        name: nutrient.name,
        unit: nutrient.unit,
        category: nutrient.category,
        defaultDailyValue: nutrient.defaultDailyValue,
        sortOrder: nutrient.sortOrder,
        trackable: nutrient.trackable,
      },
    });
  }

  const adminEmail = "admin@example.com";
  const adminPassword = "Admin1234!";
  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!existingAdmin) {
    await prisma.user.create({
      data: {
        email: adminEmail,
        passwordHash: await bcrypt.hash(adminPassword, 10),
        name: "系統管理員",
        role: "ADMIN",
      },
    });
    console.log(`已建立管理員帳號 -> email: ${adminEmail} / password: ${adminPassword}`);
  } else {
    console.log("管理員帳號已存在,略過建立。");
  }

  console.log("Seed 完成。食物資料請另外執行 `npx tsx prisma/import-tfnd.ts` 從衛福部 TFND 開放資料匯入。");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
