export type Role = "USER" | "ADMIN";

export type Gender = "MALE" | "FEMALE";

export type ActivityLevel = "SEDENTARY" | "LIGHT" | "MODERATE" | "ACTIVE";

export type Goal = "MAINTAIN" | "CUT" | "BULK";

export type MealType = "BREAKFAST" | "LUNCH" | "DINNER" | "SNACK";

export type RecordSource = "MANUAL" | "AI_FOOD_PHOTO" | "AI_LABEL_PHOTO";

export const GENDER_LABELS: Record<Gender, string> = {
  MALE: "男性",
  FEMALE: "女性",
};

export const ACTIVITY_LEVEL_LABELS: Record<ActivityLevel, string> = {
  SEDENTARY: "久坐(很少運動)",
  LIGHT: "輕度活動(每週運動1-3天)",
  MODERATE: "中度活動(每週運動3-5天)",
  ACTIVE: "高度活動(每週運動6-7天)",
};

export const GOAL_LABELS: Record<Goal, string> = {
  MAINTAIN: "維持體重",
  CUT: "減脂",
  BULK: "增肌",
};

export const MEAL_TYPE_LABELS: Record<MealType, string> = {
  BREAKFAST: "早餐",
  LUNCH: "午餐",
  DINNER: "晚餐",
  SNACK: "點心",
};

export const MEAL_TYPE_ICONS: Record<MealType, string> = {
  BREAKFAST: "🍳",
  LUNCH: "🍱",
  DINNER: "🍲",
  SNACK: "🍎",
};
