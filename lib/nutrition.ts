import type { ActivityLevel, Gender, Goal } from "@/lib/types";
import type { Nutrient } from "@/app/generated/prisma/client";

const ACTIVITY_FACTORS: Record<ActivityLevel, number> = {
  SEDENTARY: 1.2,
  LIGHT: 1.375,
  MODERATE: 1.55,
  ACTIVE: 1.725,
};

const GOAL_CALORIE_ADJUSTMENT: Record<Goal, number> = {
  MAINTAIN: 0,
  CUT: -500,
  BULK: 300,
};

// share of the daily calorie target assigned to each macronutrient
const MACRO_CALORIE_SHARE = { protein: 0.2, fat: 0.27, carbohydrate: 0.53 };
const KCAL_PER_GRAM = { protein: 4, fat: 9, carbohydrate: 4 };

export interface ProfileInput {
  gender: Gender;
  birthYear: number;
  heightCm: number;
  weightKg: number;
  activityLevel: ActivityLevel;
  goal: Goal;
}

export function calculateAge(birthYear: number, today = new Date()): number {
  return today.getFullYear() - birthYear;
}

export function calculateBMR(profile: ProfileInput): number {
  const age = calculateAge(profile.birthYear);
  const base = 10 * profile.weightKg + 6.25 * profile.heightCm - 5 * age;
  return profile.gender === "MALE" ? base + 5 : base - 161;
}

export function calculateCalorieTarget(profile: ProfileInput): number {
  const tdee = calculateBMR(profile) * ACTIVITY_FACTORS[profile.activityLevel];
  return Math.round(tdee + GOAL_CALORIE_ADJUSTMENT[profile.goal]);
}

/**
 * Computes the daily target for every known nutrient.
 * calorie/protein/fat/carbohydrate are derived from the profile;
 * everything else falls back to the admin-configured default daily value.
 */
export function calculateNutrientTargets(
  profile: ProfileInput,
  nutrients: Pick<Nutrient, "id" | "key" | "defaultDailyValue">[]
): { nutrientId: string; dailyTarget: number }[] {
  const calorieTarget = calculateCalorieTarget(profile);

  return nutrients.map((nutrient) => {
    switch (nutrient.key) {
      case "calorie":
        return { nutrientId: nutrient.id, dailyTarget: calorieTarget };
      case "protein":
      case "fat":
      case "carbohydrate": {
        const grams =
          (calorieTarget * MACRO_CALORIE_SHARE[nutrient.key]) /
          KCAL_PER_GRAM[nutrient.key];
        return { nutrientId: nutrient.id, dailyTarget: Math.round(grams) };
      }
      default:
        return { nutrientId: nutrient.id, dailyTarget: nutrient.defaultDailyValue };
    }
  });
}
