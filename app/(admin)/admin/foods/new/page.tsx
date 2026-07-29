import { prisma } from "@/lib/db";
import FoodForm from "../FoodForm";

export default async function NewFoodPage() {
  const nutrients = await prisma.nutrient.findMany({
    where: { trackable: true },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">新增食物</h1>
      <FoodForm nutrients={nutrients} />
    </div>
  );
}
