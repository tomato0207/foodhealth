/**
 * Maps every numeric 分析項 (nutrient) column in the TFND (衛福部食品營養成分資料庫) bulk export
 * to a stable ASCII `key` used throughout this app. Shared by prisma/seed.ts (defines the Nutrient
 * rows) and prisma/import-tfnd.ts (looks up which Nutrient a CSV row belongs to).
 *
 * `trackable: false` marks amino-acid / fatty-acid breakdowns: real TFND data, kept in FoodNutrient
 * for completeness, but excluded from personal daily targets, /today, the AI photo prompt, and the
 * manual entry form — nobody sets a "daily amino acid target", and surfacing 100+ fields there would
 * make those screens unusable.
 *
 * The CSV's "P/M/S" fatty-acid-ratio row (e.g. "3.29/1.00/1.67") is intentionally NOT listed here —
 * it's text, not a number, and doesn't fit the Float `amountPerServing` column.
 */

export interface TfndNutrientDef {
  /** exact 分析項 text as it appears in the TFND CSV/detail page */
  sourceName: string;
  key: string;
  name: string;
  unit: string;
  category: string;
  trackable: boolean;
  defaultDailyValue: number;
  sortOrder: number;
}

export const TFND_NUTRIENTS: TfndNutrientDef[] = [
  // 一般成分
  { sourceName: "熱量", key: "calorie", name: "熱量", unit: "kcal", category: "一般成分", trackable: true, defaultDailyValue: 2000, sortOrder: 1 },
  { sourceName: "修正熱量", key: "calorie_corrected", name: "修正熱量", unit: "kcal", category: "一般成分", trackable: false, defaultDailyValue: 2000, sortOrder: 2 },
  { sourceName: "水分", key: "water", name: "水分", unit: "g", category: "一般成分", trackable: false, defaultDailyValue: 0, sortOrder: 3 },
  { sourceName: "粗蛋白", key: "protein", name: "蛋白質", unit: "g", category: "一般成分", trackable: true, defaultDailyValue: 60, sortOrder: 4 },
  { sourceName: "粗脂肪", key: "fat", name: "脂肪", unit: "g", category: "一般成分", trackable: true, defaultDailyValue: 60, sortOrder: 5 },
  { sourceName: "飽和脂肪", key: "saturated_fat", name: "飽和脂肪", unit: "g", category: "一般成分", trackable: true, defaultDailyValue: 20, sortOrder: 6 },
  { sourceName: "灰分", key: "ash", name: "灰分", unit: "g", category: "一般成分", trackable: false, defaultDailyValue: 0, sortOrder: 7 },
  { sourceName: "總碳水化合物", key: "carbohydrate", name: "碳水化合物", unit: "g", category: "一般成分", trackable: true, defaultDailyValue: 300, sortOrder: 8 },
  { sourceName: "膳食纖維", key: "fiber", name: "膳食纖維", unit: "g", category: "一般成分", trackable: false, defaultDailyValue: 25, sortOrder: 9 },

  // 糖質分析
  { sourceName: "糖質總量", key: "sugar", name: "糖", unit: "g", category: "糖質分析", trackable: true, defaultDailyValue: 50, sortOrder: 10 },
  { sourceName: "蔗糖", key: "sucrose", name: "蔗糖", unit: "g", category: "糖質分析", trackable: false, defaultDailyValue: 0, sortOrder: 11 },
  { sourceName: "葡萄糖", key: "glucose", name: "葡萄糖", unit: "g", category: "糖質分析", trackable: false, defaultDailyValue: 0, sortOrder: 12 },
  { sourceName: "果糖", key: "fructose", name: "果糖", unit: "g", category: "糖質分析", trackable: false, defaultDailyValue: 0, sortOrder: 13 },
  { sourceName: "半乳糖", key: "galactose", name: "半乳糖", unit: "g", category: "糖質分析", trackable: false, defaultDailyValue: 0, sortOrder: 14 },
  { sourceName: "麥芽糖", key: "maltose", name: "麥芽糖", unit: "g", category: "糖質分析", trackable: false, defaultDailyValue: 0, sortOrder: 15 },
  { sourceName: "乳糖", key: "lactose", name: "乳糖", unit: "g", category: "糖質分析", trackable: false, defaultDailyValue: 0, sortOrder: 16 },

  // 礦物質
  { sourceName: "鈣", key: "calcium", name: "鈣", unit: "mg", category: "礦物質", trackable: false, defaultDailyValue: 1000, sortOrder: 17 },
  { sourceName: "鈉", key: "sodium", name: "鈉", unit: "mg", category: "礦物質", trackable: true, defaultDailyValue: 2000, sortOrder: 18 },
  { sourceName: "磷", key: "phosphorus", name: "磷", unit: "mg", category: "礦物質", trackable: false, defaultDailyValue: 800, sortOrder: 19 },
  { sourceName: "鉀", key: "potassium", name: "鉀", unit: "mg", category: "礦物質", trackable: false, defaultDailyValue: 3500, sortOrder: 20 },
  { sourceName: "鎂", key: "magnesium", name: "鎂", unit: "mg", category: "礦物質", trackable: false, defaultDailyValue: 320, sortOrder: 21 },
  { sourceName: "鐵", key: "iron", name: "鐵", unit: "mg", category: "礦物質", trackable: false, defaultDailyValue: 15, sortOrder: 22 },
  { sourceName: "鋅", key: "zinc", name: "鋅", unit: "mg", category: "礦物質", trackable: false, defaultDailyValue: 12, sortOrder: 23 },
  { sourceName: "銅", key: "copper", name: "銅", unit: "mg", category: "礦物質", trackable: false, defaultDailyValue: 0.9, sortOrder: 24 },
  { sourceName: "錳", key: "manganese", name: "錳", unit: "mg", category: "礦物質", trackable: false, defaultDailyValue: 2.3, sortOrder: 25 },

  // 維生素A
  { sourceName: "維生素A總量(IU)", key: "vitamin_a_iu", name: "維生素A總量(IU)", unit: "I.U.", category: "維生素A", trackable: false, defaultDailyValue: 0, sortOrder: 26 },
  { sourceName: "視網醇當量(RE)", key: "vitamin_a", name: "維生素A(視網醇當量)", unit: "ug", category: "維生素A", trackable: false, defaultDailyValue: 600, sortOrder: 27 },
  { sourceName: "α-胡蘿蔔素", key: "alpha_carotene", name: "α-胡蘿蔔素", unit: "ug", category: "維生素A", trackable: false, defaultDailyValue: 0, sortOrder: 28 },
  { sourceName: "β-胡蘿蔔素", key: "beta_carotene", name: "β-胡蘿蔔素", unit: "ug", category: "維生素A", trackable: false, defaultDailyValue: 0, sortOrder: 29 },
  { sourceName: "視網醇", key: "retinol", name: "視網醇", unit: "ug", category: "維生素A", trackable: false, defaultDailyValue: 0, sortOrder: 30 },

  // 維生素D
  { sourceName: "維生素D總量(IU)", key: "vitamin_d_iu", name: "維生素D總量(IU)", unit: "I.U.", category: "維生素D", trackable: false, defaultDailyValue: 0, sortOrder: 31 },
  { sourceName: "維生素D總量(ug)", key: "vitamin_d", name: "維生素D", unit: "ug", category: "維生素D", trackable: false, defaultDailyValue: 10, sortOrder: 32 },
  { sourceName: "維生素D2", key: "vitamin_d2", name: "維生素D2", unit: "ug", category: "維生素D", trackable: false, defaultDailyValue: 0, sortOrder: 33 },
  { sourceName: "維生素D3", key: "vitamin_d3", name: "維生素D3", unit: "ug", category: "維生素D", trackable: false, defaultDailyValue: 0, sortOrder: 34 },

  // 維生素E
  { sourceName: "維生素E總量", key: "vitamin_e", name: "維生素E", unit: "mg", category: "維生素E", trackable: false, defaultDailyValue: 12, sortOrder: 35 },
  { sourceName: "α-維生素E當量(α-TE)", key: "vitamin_e_ate", name: "α-維生素E當量(α-TE)", unit: "mg", category: "維生素E", trackable: false, defaultDailyValue: 0, sortOrder: 36 },
  { sourceName: "α-生育酚", key: "alpha_tocopherol", name: "α-生育酚", unit: "mg", category: "維生素E", trackable: false, defaultDailyValue: 0, sortOrder: 37 },
  { sourceName: "β-生育酚", key: "beta_tocopherol", name: "β-生育酚", unit: "mg", category: "維生素E", trackable: false, defaultDailyValue: 0, sortOrder: 38 },
  { sourceName: "γ-生育酚", key: "gamma_tocopherol", name: "γ-生育酚", unit: "mg", category: "維生素E", trackable: false, defaultDailyValue: 0, sortOrder: 39 },
  { sourceName: "δ-生育酚", key: "delta_tocopherol", name: "δ-生育酚", unit: "mg", category: "維生素E", trackable: false, defaultDailyValue: 0, sortOrder: 40 },

  // 維生素K
  { sourceName: "維生素K1", key: "vitamin_k1", name: "維生素K1", unit: "ug", category: "維生素K", trackable: false, defaultDailyValue: 90, sortOrder: 41 },
  { sourceName: "維生素K2(MK-4)", key: "vitamin_k2_mk4", name: "維生素K2(MK-4)", unit: "ug", category: "維生素K", trackable: false, defaultDailyValue: 0, sortOrder: 42 },
  { sourceName: "維生素K2(MK-7)", key: "vitamin_k2_mk7", name: "維生素K2(MK-7)", unit: "ug", category: "維生素K", trackable: false, defaultDailyValue: 0, sortOrder: 43 },

  // 維生素B群及C
  { sourceName: "維生素B1", key: "vitamin_b1", name: "維生素B1", unit: "mg", category: "維生素B群及C", trackable: false, defaultDailyValue: 1.1, sortOrder: 44 },
  { sourceName: "維生素B2", key: "vitamin_b2", name: "維生素B2", unit: "mg", category: "維生素B群及C", trackable: false, defaultDailyValue: 1.1, sortOrder: 45 },
  { sourceName: "菸鹼素", key: "niacin", name: "菸鹼素", unit: "mg", category: "維生素B群及C", trackable: false, defaultDailyValue: 14, sortOrder: 46 },
  { sourceName: "維生素B6", key: "vitamin_b6", name: "維生素B6", unit: "mg", category: "維生素B群及C", trackable: false, defaultDailyValue: 1.5, sortOrder: 47 },
  { sourceName: "維生素B12", key: "vitamin_b12", name: "維生素B12", unit: "ug", category: "維生素B群及C", trackable: false, defaultDailyValue: 2.4, sortOrder: 48 },
  { sourceName: "葉酸", key: "folate", name: "葉酸", unit: "ug", category: "維生素B群及C", trackable: false, defaultDailyValue: 400, sortOrder: 49 },
  { sourceName: "維生素C", key: "vitamin_c", name: "維生素C", unit: "mg", category: "維生素B群及C", trackable: false, defaultDailyValue: 100, sortOrder: 50 },

  // 其他
  { sourceName: "膽固醇", key: "cholesterol", name: "膽固醇", unit: "mg", category: "其他", trackable: false, defaultDailyValue: 300, sortOrder: 51 },
  { sourceName: "酒精含量", key: "alcohol", name: "酒精", unit: "g", category: "其他", trackable: false, defaultDailyValue: 0, sortOrder: 52 },
  { sourceName: "反式脂肪", key: "trans_fat", name: "反式脂肪", unit: "mg", category: "其他", trackable: true, defaultDailyValue: 0, sortOrder: 53 },

  // 胺基酸組成 (not personal daily targets — see file header)
  { sourceName: "水解胺基酸總量", key: "aa_total", name: "水解胺基酸總量", unit: "mg", category: "胺基酸組成", trackable: false, defaultDailyValue: 0, sortOrder: 54 },
  { sourceName: "天門冬胺酸(Asp)", key: "aa_asp", name: "天門冬胺酸(Asp)", unit: "mg", category: "胺基酸組成", trackable: false, defaultDailyValue: 0, sortOrder: 55 },
  { sourceName: "酥胺酸(Thr)", key: "aa_thr", name: "酥胺酸(Thr)", unit: "mg", category: "胺基酸組成", trackable: false, defaultDailyValue: 0, sortOrder: 56 },
  { sourceName: "絲胺酸(Ser)", key: "aa_ser", name: "絲胺酸(Ser)", unit: "mg", category: "胺基酸組成", trackable: false, defaultDailyValue: 0, sortOrder: 57 },
  { sourceName: "麩胺酸(Glu)", key: "aa_glu", name: "麩胺酸(Glu)", unit: "mg", category: "胺基酸組成", trackable: false, defaultDailyValue: 0, sortOrder: 58 },
  { sourceName: "脯胺酸(Pro)", key: "aa_pro", name: "脯胺酸(Pro)", unit: "mg", category: "胺基酸組成", trackable: false, defaultDailyValue: 0, sortOrder: 59 },
  { sourceName: "甘胺酸(Gly)", key: "aa_gly", name: "甘胺酸(Gly)", unit: "mg", category: "胺基酸組成", trackable: false, defaultDailyValue: 0, sortOrder: 60 },
  { sourceName: "丙胺酸(Ala)", key: "aa_ala", name: "丙胺酸(Ala)", unit: "mg", category: "胺基酸組成", trackable: false, defaultDailyValue: 0, sortOrder: 61 },
  { sourceName: "胱胺酸(Cys)", key: "aa_cys", name: "胱胺酸(Cys)", unit: "mg", category: "胺基酸組成", trackable: false, defaultDailyValue: 0, sortOrder: 62 },
  { sourceName: "纈胺酸(Val)", key: "aa_val", name: "纈胺酸(Val)", unit: "mg", category: "胺基酸組成", trackable: false, defaultDailyValue: 0, sortOrder: 63 },
  { sourceName: "甲硫胺酸(Met)", key: "aa_met", name: "甲硫胺酸(Met)", unit: "mg", category: "胺基酸組成", trackable: false, defaultDailyValue: 0, sortOrder: 64 },
  { sourceName: "異白胺酸(Ile)", key: "aa_ile", name: "異白胺酸(Ile)", unit: "mg", category: "胺基酸組成", trackable: false, defaultDailyValue: 0, sortOrder: 65 },
  { sourceName: "白胺酸(Leu)", key: "aa_leu", name: "白胺酸(Leu)", unit: "mg", category: "胺基酸組成", trackable: false, defaultDailyValue: 0, sortOrder: 66 },
  { sourceName: "酪胺酸(Tyr)", key: "aa_tyr", name: "酪胺酸(Tyr)", unit: "mg", category: "胺基酸組成", trackable: false, defaultDailyValue: 0, sortOrder: 67 },
  { sourceName: "苯丙胺酸(Phe)", key: "aa_phe", name: "苯丙胺酸(Phe)", unit: "mg", category: "胺基酸組成", trackable: false, defaultDailyValue: 0, sortOrder: 68 },
  { sourceName: "離胺酸(Lys)", key: "aa_lys", name: "離胺酸(Lys)", unit: "mg", category: "胺基酸組成", trackable: false, defaultDailyValue: 0, sortOrder: 69 },
  { sourceName: "組胺酸(His)", key: "aa_his", name: "組胺酸(His)", unit: "mg", category: "胺基酸組成", trackable: false, defaultDailyValue: 0, sortOrder: 70 },
  { sourceName: "精胺酸(Arg)", key: "aa_arg", name: "精胺酸(Arg)", unit: "mg", category: "胺基酸組成", trackable: false, defaultDailyValue: 0, sortOrder: 71 },
  { sourceName: "色胺酸(Trp)", key: "aa_trp", name: "色胺酸(Trp)", unit: "mg", category: "胺基酸組成", trackable: false, defaultDailyValue: 0, sortOrder: 72 },

  // 脂肪酸組成 (not personal daily targets — see file header). "P/M/S" ratio row is intentionally omitted.
  { sourceName: "脂肪酸S總量", key: "fa_saturated_total", name: "脂肪酸S總量", unit: "mg", category: "脂肪酸組成", trackable: false, defaultDailyValue: 0, sortOrder: 73 },
  { sourceName: "酪酸(4:0)", key: "fa_c4_0", name: "酪酸(4:0)", unit: "mg", category: "脂肪酸組成", trackable: false, defaultDailyValue: 0, sortOrder: 74 },
  { sourceName: "己酸(6:0)", key: "fa_c6_0", name: "己酸(6:0)", unit: "mg", category: "脂肪酸組成", trackable: false, defaultDailyValue: 0, sortOrder: 75 },
  { sourceName: "辛酸(8:0)", key: "fa_c8_0", name: "辛酸(8:0)", unit: "mg", category: "脂肪酸組成", trackable: false, defaultDailyValue: 0, sortOrder: 76 },
  { sourceName: "癸酸(10:0)", key: "fa_c10_0", name: "癸酸(10:0)", unit: "mg", category: "脂肪酸組成", trackable: false, defaultDailyValue: 0, sortOrder: 77 },
  { sourceName: "月桂酸(12:0)", key: "fa_c12_0", name: "月桂酸(12:0)", unit: "mg", category: "脂肪酸組成", trackable: false, defaultDailyValue: 0, sortOrder: 78 },
  { sourceName: "十三酸(13:0)", key: "fa_c13_0", name: "十三酸(13:0)", unit: "mg", category: "脂肪酸組成", trackable: false, defaultDailyValue: 0, sortOrder: 79 },
  { sourceName: "肉豆蔻酸(14:0)", key: "fa_c14_0", name: "肉豆蔻酸(14:0)", unit: "mg", category: "脂肪酸組成", trackable: false, defaultDailyValue: 0, sortOrder: 80 },
  { sourceName: "十五酸(15:0)", key: "fa_c15_0", name: "十五酸(15:0)", unit: "mg", category: "脂肪酸組成", trackable: false, defaultDailyValue: 0, sortOrder: 81 },
  { sourceName: "棕櫚酸(16:0)", key: "fa_c16_0", name: "棕櫚酸(16:0)", unit: "mg", category: "脂肪酸組成", trackable: false, defaultDailyValue: 0, sortOrder: 82 },
  { sourceName: "十七酸(17:0)", key: "fa_c17_0", name: "十七酸(17:0)", unit: "mg", category: "脂肪酸組成", trackable: false, defaultDailyValue: 0, sortOrder: 83 },
  { sourceName: "硬脂酸(18:0)", key: "fa_c18_0", name: "硬脂酸(18:0)", unit: "mg", category: "脂肪酸組成", trackable: false, defaultDailyValue: 0, sortOrder: 84 },
  { sourceName: "十九酸(19:0)", key: "fa_c19_0", name: "十九酸(19:0)", unit: "mg", category: "脂肪酸組成", trackable: false, defaultDailyValue: 0, sortOrder: 85 },
  { sourceName: "花生酸(20:0)", key: "fa_c20_0", name: "花生酸(20:0)", unit: "mg", category: "脂肪酸組成", trackable: false, defaultDailyValue: 0, sortOrder: 86 },
  { sourceName: "山酸(22:0)", key: "fa_c22_0", name: "山酸(22:0)", unit: "mg", category: "脂肪酸組成", trackable: false, defaultDailyValue: 0, sortOrder: 87 },
  { sourceName: "廿四酸(24:0)", key: "fa_c24_0", name: "廿四酸(24:0)", unit: "mg", category: "脂肪酸組成", trackable: false, defaultDailyValue: 0, sortOrder: 88 },
  { sourceName: "脂肪酸M總量", key: "fa_mono_total", name: "脂肪酸M總量", unit: "mg", category: "脂肪酸組成", trackable: false, defaultDailyValue: 0, sortOrder: 89 },
  { sourceName: "肉豆蔻烯酸(14:1)", key: "fa_c14_1", name: "肉豆蔻烯酸(14:1)", unit: "mg", category: "脂肪酸組成", trackable: false, defaultDailyValue: 0, sortOrder: 90 },
  { sourceName: "棕櫚烯酸(16:1)", key: "fa_c16_1", name: "棕櫚烯酸(16:1)", unit: "mg", category: "脂肪酸組成", trackable: false, defaultDailyValue: 0, sortOrder: 91 },
  { sourceName: "油酸(18:1)", key: "fa_c18_1", name: "油酸(18:1)", unit: "mg", category: "脂肪酸組成", trackable: false, defaultDailyValue: 0, sortOrder: 92 },
  { sourceName: "鱈烯酸(20:1)", key: "fa_c20_1", name: "鱈烯酸(20:1)", unit: "mg", category: "脂肪酸組成", trackable: false, defaultDailyValue: 0, sortOrder: 93 },
  { sourceName: "芥子酸(22:1)", key: "fa_c22_1", name: "芥子酸(22:1)", unit: "mg", category: "脂肪酸組成", trackable: false, defaultDailyValue: 0, sortOrder: 94 },
  { sourceName: "脂肪酸P總量", key: "fa_poly_total", name: "脂肪酸P總量", unit: "mg", category: "脂肪酸組成", trackable: false, defaultDailyValue: 0, sortOrder: 95 },
  { sourceName: "亞麻油酸(18:2)", key: "fa_c18_2", name: "亞麻油酸(18:2)", unit: "mg", category: "脂肪酸組成", trackable: false, defaultDailyValue: 0, sortOrder: 96 },
  { sourceName: "次亞麻油酸(18:3)", key: "fa_c18_3", name: "次亞麻油酸(18:3)", unit: "mg", category: "脂肪酸組成", trackable: false, defaultDailyValue: 0, sortOrder: 97 },
  { sourceName: "十八碳四烯酸(18:4)", key: "fa_c18_4", name: "十八碳四烯酸(18:4)", unit: "mg", category: "脂肪酸組成", trackable: false, defaultDailyValue: 0, sortOrder: 98 },
  { sourceName: "花生油酸(20:4)", key: "fa_c20_4", name: "花生油酸(20:4)", unit: "mg", category: "脂肪酸組成", trackable: false, defaultDailyValue: 0, sortOrder: 99 },
  { sourceName: "廿碳五烯酸(20:5)", key: "fa_c20_5", name: "廿碳五烯酸(20:5)", unit: "mg", category: "脂肪酸組成", trackable: false, defaultDailyValue: 0, sortOrder: 100 },
  { sourceName: "廿二碳五烯酸(22:5)", key: "fa_c22_5", name: "廿二碳五烯酸(22:5)", unit: "mg", category: "脂肪酸組成", trackable: false, defaultDailyValue: 0, sortOrder: 101 },
  { sourceName: "廿二碳六烯酸(22:6)", key: "fa_c22_6", name: "廿二碳六烯酸(22:6)", unit: "mg", category: "脂肪酸組成", trackable: false, defaultDailyValue: 0, sortOrder: 102 },
  { sourceName: "其他脂肪酸", key: "fa_other", name: "其他脂肪酸", unit: "mg", category: "脂肪酸組成", trackable: false, defaultDailyValue: 0, sortOrder: 103 },
];

export const TFND_NUTRIENT_BY_SOURCE_NAME = new Map(TFND_NUTRIENTS.map((n) => [n.sourceName, n]));
