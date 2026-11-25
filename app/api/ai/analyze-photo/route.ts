import { prisma } from "@/lib/db";
import { requireUser, AuthError } from "@/lib/auth";
import { saveUploadedImage } from "@/lib/uploads";
import {
  analyzePhoto,
  getAiSettings,
  getAllowedProviders,
  getDefaultProvider,
  isAiProvider,
  type PhotoAnalysisMode,
} from "@/lib/ai";

const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export async function POST(request: Request) {
  let user;
  try {
    user = await requireUser();
  } catch (error) {
    if (error instanceof AuthError) return Response.json({ error: "請先登入。" }, { status: 401 });
    throw error;
  }

  const formData = await request.formData().catch(() => null);
  const file = formData?.get("file");
  const mode = formData?.get("mode") as PhotoAnalysisMode | null;
  const requestedProvider = formData?.get("provider");
  const aiSettings = await getAiSettings();
  const allowedProviders = getAllowedProviders(aiSettings);
  // when the admin fixed a backend, it's used no matter what the client sent
  const provider =
    allowedProviders.length === 1
      ? allowedProviders[0]
      : requestedProvider == null
        ? getDefaultProvider()
        : requestedProvider;

  if (!(file instanceof File)) {
    return Response.json({ error: "請上傳照片。" }, { status: 400 });
  }
  if (mode !== "food" && mode !== "label") {
    return Response.json({ error: "辨識模式不正確。" }, { status: 400 });
  }
  if (!isAiProvider(provider)) {
    return Response.json({ error: "AI 辨識後端不正確。" }, { status: 400 });
  }
  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    return Response.json({ error: "僅支援 JPEG、PNG 或 WebP 格式的照片。" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const savedImage = await saveUploadedImage(user.id, buffer, file.type);
  const nutrients = await prisma.nutrient.findMany({
    where: { trackable: true },
    orderBy: { sortOrder: "asc" },
  });

  try {
    const result = await analyzePhoto(
      provider,
      aiSettings,
      mode,
      { base64: buffer.toString("base64"), mimeType: file.type },
      nutrients
    );
    if (result.items.length === 0) {
      const subject = mode === "food" ? "食物" : "營養標示";
      return Response.json(
        { error: `AI 無法從這張照片辨識出${subject},請確認照片內容後重新拍攝,或改用手動輸入。`, imageId: savedImage.id },
        { status: 422 }
      );
    }
    return Response.json({ ok: true, imageId: savedImage.id, items: result.items });
  } catch (error) {
    console.error(`[analyze-photo] ${provider} failed:`, error);
    return Response.json(
      { error: error instanceof Error ? error.message : "AI 辨識失敗。", imageId: savedImage.id },
      { status: 502 }
    );
  }
}
