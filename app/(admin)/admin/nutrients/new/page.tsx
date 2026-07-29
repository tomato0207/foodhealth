import NutrientForm from "../NutrientForm";

export default function NewNutrientPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">新增營養素</h1>
      <NutrientForm />
    </div>
  );
}
