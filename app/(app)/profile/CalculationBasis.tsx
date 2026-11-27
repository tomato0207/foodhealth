"use client";

import {
  ACTIVITY_FACTORS,
  GOAL_CALORIE_ADJUSTMENT,
  LIMIT_CALORIE_SHARE,
  MACRO_CALORIE_SHARE,
  calculateAge,
  calculateBMR,
  calculateCalorieTarget,
  calculateNutrientTargets,
  calculateTDEE,
  type ProfileInput,
} from "@/lib/nutrition";
import { ACTIVITY_LEVEL_LABELS, GOAL_LABELS } from "@/lib/types";
import type { EditorNutrient } from "./ProfileEditor";

const fmt = (n: number) => n.toLocaleString("zh-TW", { maximumFractionDigits: 1 });
const pct = (share: number) => `${Math.round(share * 100)}%`;

function Step({ label, formula, result }: { label: string; formula: string; result: string }) {
  return (
    <div className="flex flex-col gap-0.5 border-b border-black/5 py-2.5 last:border-0 sm:flex-row sm:items-baseline sm:gap-3">
      <span className="w-28 shrink-0 font-medium text-gray-700">{label}</span>
      <span className="flex-1 text-gray-500">{formula}</span>
      <span className="font-semibold text-gray-900">{result}</span>
    </div>
  );
}

/** Walks through how the daily targets are derived, using the profile currently in the form. */
export default function CalculationBasis({
  profile,
  nutrients,
}: {
  profile: ProfileInput;
  nutrients: EditorNutrient[];
}) {
  const age = calculateAge(profile.birthYear);
  const bmr = calculateBMR(profile);
  const factor = ACTIVITY_FACTORS[profile.activityLevel];
  const tdee = calculateTDEE(profile);
  const adjustment = GOAL_CALORIE_ADJUSTMENT[profile.goal];
  const calories = calculateCalorieTarget(profile);

  const byKey = new Map(nutrients.map((n) => [n.key, n]));
  const targetByKey = new Map(
    calculateNutrientTargets(profile, nutrients).map((t) => [
      nutrients.find((n) => n.id === t.nutrientId)?.key,
      t.dailyTarget,
    ])
  );
  const target = (key: string) => {
    const n = byKey.get(key);
    const value = targetByKey.get(key);
    return n && value !== undefined ? `${fmt(value)} ${n.unit}` : "—";
  };

  const genderTerm = profile.gender === "MALE" ? "+ 5(男性)" : "− 161(女性)";

  return (
    <div className="flex flex-col gap-5 text-sm">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">計算依據</h2>
        <p className="mt-1 text-gray-500">以下用你目前填寫的資料逐步計算,數字會隨上方表單即時更新。</p>
      </div>

      <div>
        <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-400">1. 每日熱量</h3>
        <Step
          label="基礎代謝 BMR"
          formula={`10 × ${fmt(profile.weightKg)} kg + 6.25 × ${fmt(profile.heightCm)} cm − 5 × ${age} 歲 ${genderTerm}`}
          result={`${fmt(Math.round(bmr))} kcal`}
        />
        <Step
          label="每日消耗 TDEE"
          formula={`BMR × ${factor}(${ACTIVITY_LEVEL_LABELS[profile.activityLevel]})`}
          result={`${fmt(Math.round(tdee))} kcal`}
        />
        <Step
          label="目標熱量"
          formula={`TDEE ${adjustment >= 0 ? "+" : "−"} ${Math.abs(adjustment)} kcal(${GOAL_LABELS[profile.goal]})`}
          result={`${fmt(calories)} kcal`}
        />
      </div>

      <div>
        <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-400">2. 三大營養素(佔目標熱量比例)</h3>
        <Step label="蛋白質" formula={`${fmt(calories)} × ${pct(MACRO_CALORIE_SHARE.protein)} ÷ 4 kcal/g`} result={target("protein")} />
        <Step label="脂肪" formula={`${fmt(calories)} × ${pct(MACRO_CALORIE_SHARE.fat)} ÷ 9 kcal/g`} result={target("fat")} />
        <Step
          label="碳水化合物"
          formula={`${fmt(calories)} × ${pct(MACRO_CALORIE_SHARE.carbohydrate)} ÷ 4 kcal/g`}
          result={target("carbohydrate")}
        />
      </div>

      <div>
        <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-400">3. 建議上限</h3>
        <Step
          label="飽和脂肪"
          formula={`< 熱量 ${pct(LIMIT_CALORIE_SHARE.saturated_fat)}:${fmt(calories)} × ${pct(LIMIT_CALORIE_SHARE.saturated_fat)} ÷ 9`}
          result={target("saturated_fat")}
        />
        <Step
          label="反式脂肪"
          formula={`< 熱量 ${pct(LIMIT_CALORIE_SHARE.trans_fat)}:${fmt(calories)} × ${pct(LIMIT_CALORIE_SHARE.trans_fat)} ÷ 9`}
          result={target("trans_fat")}
        />
        <Step
          label="糖"
          formula={`< 熱量 ${pct(LIMIT_CALORIE_SHARE.sugar)}:${fmt(calories)} × ${pct(LIMIT_CALORIE_SHARE.sugar)} ÷ 4`}
          result={target("sugar")}
        />
        <Step label="鈉" formula="固定每日參考值,不隨個人資料變動" result={target("sodium")} />
      </div>

      <div className="rounded-xl bg-gray-50 p-4 text-xs leading-relaxed text-gray-600">
        <p className="mb-2 font-semibold text-gray-700">參考依據</p>
        <ol className="list-decimal space-y-1.5 pl-4">
          <li>
            基礎代謝:Mifflin-St Jeor 公式。Mifflin MD, St Jeor ST, et al. A new predictive equation for resting energy
            expenditure in healthy individuals. <i>Am J Clin Nutr</i>. 1990;51(2):241–247.
          </li>
          <li>
            活動係數:久坐 1.2、輕度 1.375、中度 1.55、高度 1.725,為估算每日總消耗常用的身體活動係數。減脂每日少攝取
            500 大卡(約每週減 0.5 公斤),增肌每日多攝取 300 大卡。
          </li>
          <li>
            三大營養素比例:衛生福利部國民健康署「國人膳食營養素參考攝取量(DRIs)」建議蛋白質佔總熱量 10–20%、脂質
            20–30%、醣類 50–60%;本系統取蛋白質 20%、脂肪 27%、碳水化合物 53%。
          </li>
          <li>
            飽和脂肪 &lt; 10%、反式脂肪 &lt; 1%、游離糖 &lt; 10% 總熱量:世界衛生組織(WHO)「Healthy diet」建議;國民健康署亦建議添加糖攝取不超過每日總熱量
            10%。
          </li>
          <li>
            鈉:衛生福利部「包裝食品營養標示」每日參考值 2000 毫克,與 WHO 建議成人每日鈉攝取 &lt; 2000 毫克相同(可由管理員調整)。
          </li>
        </ol>
        <p className="mt-2 text-gray-400">以上為一般健康成人的估算,不適用於孕哺期、慢性疾病或特殊飲食需求者,實際需求請諮詢醫師或營養師。</p>
      </div>
    </div>
  );
}
