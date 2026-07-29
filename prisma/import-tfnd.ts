/**
 * One-off / re-runnable importer for the official TFND (衛福部食品營養成分資料庫) open dataset.
 *
 * Source: https://data.gov.tw/dataset/8543 (政府資料開放授權條款-第1版, free).
 * We use the government's own bulk CSV export rather than scraping the consumer lookup site —
 * consumer.fda.gov.tw's robots.txt disallows crawling, and this official export is faster and
 * more complete anyway (one file vs. ~2200 individual detail pages).
 *
 * Usage: npx tsx prisma/import-tfnd.ts
 * Safe to re-run: foods are upserted by their TFND `整合編號` (Food.sourceCode), so re-running
 * only refreshes values instead of creating duplicates.
 */
import "dotenv/config";
import AdmZip from "adm-zip";
import { parse } from "csv-parse/sync";
import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { TFND_NUTRIENT_BY_SOURCE_NAME } from "./tfnd-nutrients";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const EXPORT_URL = "https://data.fda.gov.tw/opendata/exportDataList.do?method=ExportData&InfoId=20&logType=2";

interface CsvRow {
  食品分類: string;
  整合編號: string;
  樣品名稱: string;
  俗名: string;
  樣品英文名稱: string;
  內容物描述: string;
  分析項: string;
  每100克含量: string;
}

interface FoodGroup {
  category: string;
  name: string;
  alias: string;
  englishName: string;
  description: string;
  nutrients: Map<string, number>; // nutrient key -> amount per 100g
}

async function downloadCsv(): Promise<string> {
  console.log("下載 TFND 開放資料 ZIP...");
  const res = await fetch(EXPORT_URL, { headers: { "User-Agent": "Mozilla/5.0" } });
  if (!res.ok) throw new Error(`下載失敗: HTTP ${res.status}`);
  const buffer = Buffer.from(await res.arrayBuffer());
  const zip = new AdmZip(buffer);
  const entries = zip.getEntries();
  const csvEntry = entries.find((e) => e.entryName.toLowerCase().endsWith(".csv"));
  if (!csvEntry) throw new Error("ZIP 內找不到 CSV 檔案");
  console.log(`解壓 ${csvEntry.entryName}...`);
  return csvEntry.getData().toString("utf8");
}

function groupByFood(csvText: string): Map<string, FoodGroup> {
  const rows: CsvRow[] = parse(csvText, {
    columns: true,
    skip_empty_lines: true,
  });

  const foods = new Map<string, FoodGroup>();
  let skippedUnknownNutrient = 0;
  let skippedBlank = 0;

  for (const row of rows) {
    const code = row["整合編號"]?.trim();
    if (!code) continue;

    let food = foods.get(code);
    if (!food) {
      food = {
        category: row["食品分類"]?.trim() ?? "",
        name: row["樣品名稱"]?.trim() ?? code,
        alias: row["俗名"]?.trim() ?? "",
        englishName: row["樣品英文名稱"]?.trim() ?? "",
        description: row["內容物描述"]?.trim() ?? "",
        nutrients: new Map(),
      };
      foods.set(code, food);
    }

    const sourceName = row["分析項"]?.trim();
    const def = sourceName ? TFND_NUTRIENT_BY_SOURCE_NAME.get(sourceName) : undefined;
    if (!def) {
      skippedUnknownNutrient++;
      continue; // e.g. the "P/M/S" text ratio row, which isn't a numeric nutrient
    }

    const raw = row["每100克含量"]?.trim();
    if (!raw) {
      skippedBlank++;
      continue; // blank means "not measured", not zero — don't record a value
    }
    const amount = Number(raw);
    if (!Number.isFinite(amount)) continue;

    food.nutrients.set(def.key, amount);
  }

  console.log(
    `解析出 ${foods.size} 筆食品(略過非數值列 ${skippedUnknownNutrient} 筆、空值 ${skippedBlank} 筆)`
  );
  return foods;
}

async function importOneFood(sourceCode: string, food: FoodGroup, nutrientIdByKey: Map<string, string>) {
  const noteParts = [
    food.englishName && `英文名:${food.englishName}`,
    food.alias && `俗名:${food.alias}`,
    food.description,
  ].filter(Boolean);

  const foodData = {
    name: food.name,
    category: food.category,
    servingSize: 100,
    servingUnit: "克",
    note: noteParts.join("; ") || null,
  };

  const foodRecord = await prisma.food.upsert({
    where: { sourceCode },
    update: foodData,
    create: { sourceCode, ...foodData },
  });

  const nutrientData = [...food.nutrients]
    .map(([key, amount]) => ({ nutrientId: nutrientIdByKey.get(key), amountPerServing: amount }))
    .filter((n): n is { nutrientId: string; amountPerServing: number } => !!n.nutrientId);

  // this food's rows are always fully replaced together, so a delete + bulk insert (2 statements)
  // is equivalent to per-row upserts but ~50x fewer round trips than upserting one at a time.
  await prisma.$transaction([
    prisma.foodNutrient.deleteMany({ where: { foodId: foodRecord.id } }),
    prisma.foodNutrient.createMany({
      data: nutrientData.map((n) => ({ foodId: foodRecord.id, ...n })),
    }),
  ]);
}

const CONCURRENCY = 8;

async function main() {
  const csvText = await downloadCsv();
  const foods = groupByFood(csvText);

  const nutrientRows = await prisma.nutrient.findMany({ select: { id: true, key: true } });
  const nutrientIdByKey = new Map(nutrientRows.map((n) => [n.key, n.id]));

  const entries = [...foods.entries()];
  let processed = 0;
  const startedAt = Date.now();

  for (let i = 0; i < entries.length; i += CONCURRENCY) {
    const batch = entries.slice(i, i + CONCURRENCY);
    await Promise.all(batch.map(([sourceCode, food]) => importOneFood(sourceCode, food, nutrientIdByKey)));

    processed += batch.length;
    const elapsedSec = ((Date.now() - startedAt) / 1000).toFixed(1);
    console.log(`已處理 ${processed}/${entries.length} 筆食品(${elapsedSec}s)`);
  }

  console.log("TFND 資料匯入完成。");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
