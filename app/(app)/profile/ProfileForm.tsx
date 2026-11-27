"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ACTIVITY_LEVEL_LABELS,
  GENDER_LABELS,
  GOAL_LABELS,
  type ActivityLevel,
  type Gender,
  type Goal,
} from "@/lib/types";
import type { ProfileInput } from "@/lib/nutrition";

interface ProfileFormProps {
  /** controlled by ProfileEditor so the targets preview can follow every keystroke */
  value: ProfileInput;
  onChange: (value: ProfileInput) => void;
}

export default function ProfileForm({ value, onChange }: ProfileFormProps) {
  const router = useRouter();
  const { gender, birthYear, heightCm, weightKg, activityLevel, goal } = value;
  const set = <K extends keyof ProfileInput>(key: K, fieldValue: ProfileInput[K]) =>
    onChange({ ...value, [key]: fieldValue });
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gender, birthYear, heightCm, weightKg, activityLevel, goal }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "儲存失敗。");
        return;
      }
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <label className="flex flex-col gap-1 text-sm">
        性別
        <select
          value={gender}
          onChange={(e) => set("gender", e.target.value as Gender)}
          className="rounded-lg border border-gray-200 bg-white px-3 py-2 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
        >
          {Object.entries(GENDER_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1 text-sm">
        出生年(西元)
        <input
          type="number"
          value={birthYear}
          onChange={(e) => set("birthYear", Number(e.target.value))}
          className="rounded-lg border border-gray-200 bg-white px-3 py-2 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        身高(公分)
        <input
          type="number"
          step="0.1"
          value={heightCm}
          onChange={(e) => set("heightCm", Number(e.target.value))}
          className="rounded-lg border border-gray-200 bg-white px-3 py-2 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        體重(公斤)
        <input
          type="number"
          step="0.1"
          value={weightKg}
          onChange={(e) => set("weightKg", Number(e.target.value))}
          className="rounded-lg border border-gray-200 bg-white px-3 py-2 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        活動量
        <select
          value={activityLevel}
          onChange={(e) => set("activityLevel", e.target.value as ActivityLevel)}
          className="rounded-lg border border-gray-200 bg-white px-3 py-2 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
        >
          {Object.entries(ACTIVITY_LEVEL_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1 text-sm">
        目標
        <select
          value={goal}
          onChange={(e) => set("goal", e.target.value as Goal)}
          className="rounded-lg border border-gray-200 bg-white px-3 py-2 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
        >
          {Object.entries(GOAL_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>

      {error && <p className="text-sm text-red-600 sm:col-span-2">{error}</p>}

      <button
        type="submit"
        disabled={saving}
        className="rounded-lg bg-emerald-600 px-3 py-2 text-white shadow-sm transition-colors hover:bg-emerald-700 disabled:opacity-50 sm:col-span-2 sm:w-fit"
      >
        {saving ? "儲存中..." : "儲存並重新計算目標"}
      </button>
    </form>
  );
}
