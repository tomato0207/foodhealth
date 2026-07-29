import { randomBytes } from "crypto";
import { createClient } from "@supabase/supabase-js";
import { prisma } from "@/lib/db";

const BUCKET = "meal-photos";

const EXTENSION_BY_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

function getStorageClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("尚未設定 SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY 環境變數。");
  }
  return createClient(url, key);
}

export async function saveUploadedImage(userId: string, buffer: Buffer, mimeType: string) {
  const extension = EXTENSION_BY_MIME[mimeType];
  if (!extension) {
    throw new Error(`不支援的圖片格式:${mimeType}`);
  }

  const path = `${userId}/${randomBytes(16).toString("hex")}.${extension}`;
  const storage = getStorageClient();

  const { error } = await storage.storage.from(BUCKET).upload(path, buffer, { contentType: mimeType });
  if (error) {
    throw new Error(`上傳照片到 Supabase Storage 失敗:${error.message}`);
  }

  return prisma.uploadedImage.create({
    data: { userId, filename: path, mimeType },
  });
}

export async function readUploadedImageFile(filename: string): Promise<Buffer> {
  const storage = getStorageClient();
  const { data, error } = await storage.storage.from(BUCKET).download(filename);
  if (error || !data) {
    throw new Error(`讀取照片失敗:${error?.message ?? "unknown error"}`);
  }
  return Buffer.from(await data.arrayBuffer());
}
