"use client";

import { useState } from "react";
import { calculateNutrientTargets, type ProfileInput } from "@/lib/nutrition";
import ProfileForm from "./ProfileForm";
import TargetsTable from "./TargetsTable";
import CalculationBasis from "./CalculationBasis";

export interface EditorNutrient {
  id: string;
  key: string;
  name: string;
  unit: string;
  category: string;
  defaultDailyValue: number;
}

interface StoredTarget {
  nutrientId: string;
  dailyTarget: number;
  overridden: boolean;
}

const DEFAULT_PROFILE: ProfileInput = {
  gender: "FEMALE",
  birthYear: 1995,
  heightCm: 165,
  weightKg: 60,
  activityLevel: "LIGHT",
  goal: "MAINTAIN",
};

/** Same ranges the /api/profile endpoint accepts. */
function isPlausibleProfile(p: ProfileInput): boolean {
  const year = new Date().getFullYear();
  return (
    p.birthYear >= 1900 && p.birthYear <= year &&
    p.heightCm >= 50 && p.heightCm <= 260 &&
    p.weightKg >= 20 && p.weightKg <= 400
  );
}

/** Holds the profile being edited so the targets table and calculation breakdown update live as the form changes. */
export default function ProfileEditor({
  initialProfile,
  nutrients,
  targets,
}: {
  initialProfile: ProfileInput | null;
  nutrients: EditorNutrient[];
  targets: StoredTarget[];
}) {
  const [profile, setProfile] = useState<ProfileInput>(initialProfile ?? DEFAULT_PROFILE);
  // while a field is half-typed (e.g. height "1"), keep previewing from the last saved profile
  const previewProfile = isPlausibleProfile(profile) ? profile : (initialProfile ?? DEFAULT_PROFILE);

  const previewById = new Map(
    calculateNutrientTargets(previewProfile, nutrients).map((t) => [t.nutrientId, t.dailyTarget])
  );
  const storedById = new Map(targets.map((t) => [t.nutrientId, t]));

  const rows = nutrients.map((n) => {
    const stored = storedById.get(n.id);
    const preview = previewById.get(n.id) ?? n.defaultDailyValue;
    return {
      nutrientId: n.id,
      key: n.key,
      name: n.name,
      unit: n.unit,
      category: n.category,
      // overridden targets are the user's own numbers and never follow the profile
      dailyTarget: stored?.overridden ? stored.dailyTarget : preview,
      overridden: stored?.overridden ?? false,
      // the shown value differs from what's saved — the profile has unsaved edits
      unsaved: !stored?.overridden && stored?.dailyTarget !== preview,
    };
  });
  const hasUnsaved = initialProfile === null || rows.some((r) => r.unsaved);

  return (
    <>
      <section className="rounded-2xl border border-black/5 bg-white/90 p-6 shadow-sm shadow-black/[0.03] backdrop-blur">
        <ProfileForm value={profile} onChange={setProfile} />
      </section>

      <section className="rounded-2xl border border-black/5 bg-white/90 p-6 shadow-sm shadow-black/[0.03] backdrop-blur">
        <h2 className="text-xl font-semibold text-gray-900">每日營養素目標</h2>
        <p className="mb-4 mt-1 text-sm text-gray-500">
          會隨上方個人資料即時更新;可個別覆寫目標數值,「重設」會恢復系統依個人資料計算出的建議值。
        </p>
        {hasUnsaved && (
          <p className="mb-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
            目前顯示的是依上方資料試算的預覽值,按「儲存並重新計算目標」後才會正式套用。
          </p>
        )}
        <TargetsTable rows={rows} />
      </section>

      <section className="rounded-2xl border border-black/5 bg-white/90 p-6 shadow-sm shadow-black/[0.03] backdrop-blur">
        <CalculationBasis profile={previewProfile} nutrients={nutrients} />
      </section>
    </>
  );
}
