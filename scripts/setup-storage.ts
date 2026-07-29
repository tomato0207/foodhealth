/**
 * One-time setup: creates the private Supabase Storage bucket used for meal photos.
 * Safe to re-run — does nothing if the bucket already exists.
 *
 * Usage: npx tsx scripts/setup-storage.ts
 */
import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const BUCKET = "meal-photos";

async function main() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("請先在 .env 設定 SUPABASE_URL 與 SUPABASE_SERVICE_ROLE_KEY。");
  }

  const supabase = createClient(url, key);

  const { data: existing } = await supabase.storage.getBucket(BUCKET);
  if (existing) {
    console.log(`Bucket "${BUCKET}" 已存在,略過建立。`);
    return;
  }

  const { error } = await supabase.storage.createBucket(BUCKET, {
    public: false, // private: only our authenticated API route (via the service role key) can read files
    fileSizeLimit: "10MB",
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
  });

  if (error) {
    throw new Error(`建立 bucket 失敗:${error.message}`);
  }

  console.log(`已建立私有 bucket "${BUCKET}"。`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
