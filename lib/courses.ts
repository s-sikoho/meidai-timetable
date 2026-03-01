export type Day = "Mon" | "Tue" | "Wed" | "Thu" | "Fri";

export const DAYS: { key: Day; label: string }[] = [
  { key: "Mon", label: "月" },
  { key: "Tue", label: "火" },
  { key: "Wed", label: "水" },
  { key: "Thu", label: "木" },
  { key: "Fri", label: "金" },
];

export const PERIODS = [1, 2, 3, 4, 5] as const;
export type Period = (typeof PERIODS)[number];

export const isPeriod = (n: number): n is Period =>
  (PERIODS as readonly number[]).includes(n);

export type CellKey = `${Day}-${Period}`;

export function cellKey(day: Day, period: Period): CellKey {
  return `${day}-${period}` as const;
}

export const CELL_KEYS: { key: CellKey; label: string }[] = DAYS.flatMap((d) =>
  PERIODS.map((p) => ({
    key: `${d.key}-${p}` as CellKey,
    label: `${d.label}${p}`, // 例: 月1
  })),
);

export const isCellKey = (v: string): v is CellKey =>
  CELL_KEYS.some((c) => c.key === v);

export const DEPARTMENTS = [
  "医",
  "情報",
  "理",
  "工",
  "文",
  "経済",
  "法",
] as const;
export type Department = (typeof DEPARTMENTS)[number];

export const isDepartment = (v: string): v is Department =>
  (DEPARTMENTS as readonly string[]).includes(v);

export const SECTIONS = ["言語教養", "自然教養", "専門基礎", "専門"] as const;
export type Section = (typeof SECTIONS)[number];

export const isSection = (v: string): v is Section =>
  (SECTIONS as readonly string[]).includes(v);

export const SEMESTERS = ["春1", "春2", "秋1", "秋2", "集中"] as const;
export type Semester = (typeof SEMESTERS)[number];

export const isSemester = (v: string): v is Semester =>
  (SEMESTERS as readonly string[]).includes(v);

export type Course = {
  id: string;
  title: string;
  department: Department;
  section: Section;
  semester: Semester;
  cellKey?: CellKey;
  teacher?: string;
};

export const COURSES: Course[] = [
  {
    id: "c1",
    title: "線形代数",
    department: "情報",
    section: "自然教養",
    semester: "春1",
    cellKey: "Mon-1",
  },
  {
    id: "c2",
    title: "確率統計",
    department: "情報",
    section: "専門",
    semester: "春1",
    cellKey: "Mon-1",
  },
  {
    id: "c3",
    title: "データ構造",
    department: "情報",
    section: "専門",
    semester: "春1",
    cellKey: "Mon-1",
  },
  {
    id: "c4",
    title: "オペレーティングシステム",
    department: "情報",
    section: "専門",
    semester: "春2",
    cellKey: "Mon-1",
  },
  {
    id: "c5",
    title: "英語",
    department: "情報",
    section: "言語教養",
    semester: "春2",
    cellKey: "Mon-1",
  },
];
