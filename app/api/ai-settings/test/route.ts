import { requireAdmin, AuthError } from "@/lib/auth";
import { getAiSettings, normalizeLmStudioBaseUrl } from "@/lib/ai/settings";

/** Checks an LM Studio endpoint by listing its models — lets the admin verify the ngrok URL and key before saving. */
export async function POST(request: Request) {
  try {
    await requireAdmin();
  } catch (error) {
    if (error instanceof AuthError) {
      return Response.json({ error: "需要管理員權限。" }, { status: error.code === "FORBIDDEN" ? 403 : 401 });
    }
    throw error;
  }

  const body = await request.json().catch(() => null);
  const baseUrl = typeof body?.lmstudioBaseUrl === "string" ? normalizeLmStudioBaseUrl(body.lmstudioBaseUrl) : "";
  const typedKey = typeof body?.lmstudioApiKey === "string" ? body.lmstudioApiKey.trim() : "";
  if (!baseUrl) {
    return Response.json({ error: "請先填寫 ngrok 網址。" }, { status: 400 });
  }
  // blank key field = test with the key already saved
  const apiKey = body?.clearApiKey === true ? "" : typedKey || (await getAiSettings()).lmstudio.apiKey;

  let res: Response;
  try {
    res = await fetch(`${baseUrl}/models`, {
      headers: {
        "ngrok-skip-browser-warning": "true",
        ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
      },
      signal: AbortSignal.timeout(10_000),
      cache: "no-store",
    });
  } catch (error) {
    const timedOut = error instanceof Error && error.name === "TimeoutError";
    return Response.json(
      {
        error: timedOut
          ? "連線逾時(10 秒)。請確認對方電腦沒有睡眠、LM Studio 伺服器與 ngrok 都還在執行。"
          : `無法連線到 ${baseUrl}。請確認網址正確,且 ngrok 正在執行。`,
      },
      { status: 502 }
    );
  }

  if (res.status === 401 || res.status === 403) {
    return Response.json(
      { error: "LM Studio 拒絕連線:API 金鑰錯誤或未填寫。請確認填入的是 LM Studio 產生的金鑰。" },
      { status: 502 }
    );
  }
  if (res.status === 404) {
    return Response.json(
      { error: "找不到 LM Studio(404)。ngrok 網址可能已失效(重開 ngrok 後網址會變),或網址結尾少了 /v1。" },
      { status: 502 }
    );
  }
  if (!res.ok) {
    return Response.json({ error: `LM Studio 回應錯誤(HTTP ${res.status})。` }, { status: 502 });
  }

  const data = await res.json().catch(() => null);
  if (!Array.isArray(data?.data)) {
    return Response.json(
      { error: "連到了網址,但回應不是 LM Studio 的格式。請確認 ngrok 轉發的是 LM Studio 的 port(預設 1234)。" },
      { status: 502 }
    );
  }

  const models = (data.data as { id?: unknown }[])
    .map((m) => (typeof m.id === "string" ? m.id : null))
    .filter((id): id is string => Boolean(id));
  return Response.json({ ok: true, baseUrl, models });
}
