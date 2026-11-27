import type { ActivityLevel, Gender, Goal } from "@/lib/types";
import type { Nutrient } from "@/app/generated/prisma/client";

// physical activity multipliers applied to BMR to estimate total daily energy expenditure (TDEE)
export const ACTIVITY_FACTORS: Record<ActivityLevel, number> = {
  SEDENTARY: 1.2,
  LIGHT: 1.375,
  MODERATE: 1.55,
  ACTIVE: 1.725,
};

// -500 kcal/day ≈ 0.5 kg/week fat loss; +300 kcal/day is a modest surplus for lean gain
export const GOAL_CALORIE_ADJUSTMENT: Record<Goal, number> = {
  MAINTAIN: 0,
  CUT: -500,
  BULK: 300,
};

// share of the daily calorie target assigned to each macronutrient — within the ranges in
// 衛福部國健署「國人膳食營養素參考攝取量」(protein 10–20%, fat 20–30%, carbohydrate 50–60%)
export const MACRO_CALORIE_SHARE = { protein: 0.2, fat: 0.27, carbohydrate: 0.53 };

// upper limits as a share of daily calories: saturated fat < 10%, trans fat < 1% (WHO),
// sugar < 10% (衛福部國健署 added-sugar guideline / WHO free-sugar guideline)
export const LIMIT_CALORIE_SHARE = { saturated_fat: 0.1, trans_fat: 0.01, sugar: 0.1 };

const KCAL_PER_GRAM = { protein: 4, fat: 9, carbohydrate: 4, saturated_fat: 9, trans_fat: 9, sugar: 4 };

export interface ProfileInput {
  gender: Gender;
  birthYear: number;
  heightCm: number;
  weightKg: number;
  activityLevel: ActivityLevel;
  goal: Goal;
}

type NutrientForTarget = Pick<Nutrient, "id" | "key" | "unit" | "defaultDailyValue">;

export function calculateAge(birthYear: number, today = new Date()): number {
  return today.getFullYear() - birthYear;
}

/** Mifflin-St Jeor equation (Mifflin et al., Am J Clin Nutr 1990;51:241-7). */
export function calculateBMR(profile: ProfileInput): number {
  const age = calculateAge(profile.birthYear);
  const base = 10 * profile.weightKg + 6.25 * profile.heightCm - 5 * age;
  return profile.gender === "MALE" ? base + 5 : base - 161;
}

export function calculateTDEE(profile: ProfileInput): number {
  return calculateBMR(profile) * ACTIVITY_FACTORS[profile.activityLevel];
}

export function calculateCalorieTarget(profile: ProfileInput): number {
  return Math.round(calculateTDEE(profile) + GOAL_CALORIE_ADJUSTMENT[profile.goal]);
}

/** grams of a nutrient that supply `share` of the calorie target, expressed in the nutrient's unit (g or mg) */
function gramsFromCalories(
  calorieTarget: number,
  share: number,
  kcalPerGram: number,
  unit: string
): number {
  const grams = (calorieTarget * share) / kcalPerGram;
  return unit === "mg" ? Math.round(grams * 1000) : Math.round(grams * 10) / 10;
}

/**
 * Computes the daily target for every known nutrient.
 * Calorie, macronutrients and the saturated fat / trans fat / sugar limits are derived from the profile;
 * everything else (e.g. sodium) falls back to the admin-configured default daily value.
 */
export function calculateNutrientTargets(
  profile: ProfileInput,
  nutrients: NutrientForTarget[]
): { nutrientId: string; dailyTarget: number }[] {
  const calorieTarget = calculateCalorieTarget(profile);

  return nutrients.map((nutrient) => {
    switch (nutrient.key) {
      case "calorie":
        return { nutrientId: nutrient.id, dailyTarget: calorieTarget };
      case "protein":
      case "fat":
      case "carbohydrate":
        return {
          nutrientId: nutrient.id,
          dailyTarget: Math.round(
            gramsFromCalories(calorieTarget, MACRO_CALORIE_SHARE[nutrient.key], KCAL_PER_GRAM[nutrient.key], nutrient.unit)
          ),
        };
      case "saturated_fat":
      case "trans_fat":
      case "sugar":
        return {
          nutrientId: nutrient.id,
          dailyTarget: gramsFromCalories(
            calorieTarget,
            LIMIT_CALORIE_SHARE[nutrient.key],
            KCAL_PER_GRAM[nutrient.key],
            nutrient.unit
          ),
        };
      default:
        return { nutrientId: nutrient.id, dailyTarget: nutrient.defaultDailyValue };
    }
  });
}
