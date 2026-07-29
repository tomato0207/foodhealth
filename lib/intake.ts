interface RecordLike {
  items: { nutrientSnapshot: string }[];
}

export function sumIntake(records: RecordLike[]): Record<string, number> {
  const totals: Record<string, number> = {};
  for (const record of records) {
    for (const item of record.items) {
      const snapshot = JSON.parse(item.nutrientSnapshot) as Record<string, number>;
      for (const [key, value] of Object.entries(snapshot)) {
        totals[key] = (totals[key] ?? 0) + value;
      }
    }
  }
  return totals;
}
