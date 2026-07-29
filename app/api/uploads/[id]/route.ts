import { prisma } from "@/lib/db";
import { requireUser, AuthError } from "@/lib/auth";
import { readUploadedImageFile } from "@/lib/uploads";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let user;
  try {
    user = await requireUser();
  } catch (error) {
    if (error instanceof AuthError) return Response.json({ error: "請先登入。" }, { status: 401 });
    throw error;
  }

  const image = await prisma.uploadedImage.findUnique({ where: { id } });
  if (!image || (image.userId !== user.id && user.role !== "ADMIN")) {
    return Response.json({ error: "找不到此照片。" }, { status: 404 });
  }

  const buffer = await readUploadedImageFile(image.filename);
  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": image.mimeType,
      "Cache-Control": "private, max-age=31536000, immutable",
    },
  });
}
