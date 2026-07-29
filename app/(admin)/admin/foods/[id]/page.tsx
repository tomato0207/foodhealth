import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import FoodForm from "../FoodForm";

export default async function EditFoodPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [food, nutrients] = await Promise.all([
    prisma.food.findUnique({ where: { id }, include: { nutrients: { include: { nutrient: true } } } }),
    prisma.nutrient.findMany({ where: { trackable: true }, orderBy: { sortOrder: "asc" } }),
  ]);

  if (!food) notFound();

  const nutrientAmounts = Object.fromEntries(food.nutrients.map((fn) => [fn.nutrient.key, fn.amountPerServing]));

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">編輯食物:{food.name}</h1>
      <FoodForm
        nutrients={nutrients}
        foodId={food.id}
        initial={{
          name: food.name,
          servingSize: food.servingSize,
          servingUnit: food.servingUnit,
          category: food.category,
          note: food.note ?? "",
          nutrientAmounts,
        }}
      />
    </div>
  );
}
