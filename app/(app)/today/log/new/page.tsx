import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { todayDateString } from "@/lib/date";
import { AI_PROVIDER_LABELS, getAiSettings, getAllowedProviders, getDefaultProvider, isProviderConfigured } from "@/lib/ai";
import NewRecordForm from "./NewRecordForm";

export default async function NewRecordPage() {
  await requireUser();
  const nutrients = await prisma.nutrient.findMany({
    where: { trackable: true },
    orderBy: { sortOrder: "asc" },
  });
  const aiSettings = await getAiSettings();
  const allowedProviders = getAllowedProviders(aiSettings);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">新增用餐紀錄</h1>
      <NewRecordForm
        nutrients={nutrients.map((n) => ({ key: n.key, name: n.name, unit: n.unit }))}
        defaultDate={todayDateString()}
        aiProviders={allowedProviders.map((id) => ({
          id,
          label: AI_PROVIDER_LABELS[id],
          configured: isProviderConfigured(id, aiSettings),
        }))}
        defaultAiProvider={allowedProviders.length === 1 ? allowedProviders[0] : getDefaultProvider()}
      />
    </div>
  );
}
