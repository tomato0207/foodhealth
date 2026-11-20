import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { todayDateString } from "@/lib/date";
import { AI_PROVIDERS, AI_PROVIDER_LABELS, getDefaultProvider, isProviderConfigured } from "@/lib/ai";
import NewRecordForm from "./NewRecordForm";

export default async function NewRecordPage() {
  await requireUser();
  const nutrients = await prisma.nutrient.findMany({
    where: { trackable: true },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">新增用餐紀錄</h1>
      <NewRecordForm
        nutrients={nutrients.map((n) => ({ key: n.key, name: n.name, unit: n.unit }))}
        defaultDate={todayDateString()}
        aiProviders={AI_PROVIDERS.map((id) => ({
          id,
          label: AI_PROVIDER_LABELS[id],
          configured: isProviderConfigured(id),
        }))}
        defaultAiProvider={getDefaultProvider()}
      />
    </div>
  );
}
