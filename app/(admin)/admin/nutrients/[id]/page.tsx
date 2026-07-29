import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import NutrientForm from "../NutrientForm";

export default async function EditNutrientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const nutrient = await prisma.nutrient.findUnique({ where: { id } });
  if (!nutrient) notFound();

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">編輯營養素:{nutrient.name}</h1>
      <NutrientForm nutrientId={nutrient.id} initial={nutrient} />
    </div>
  );
}
