import { NOW_COURSES } from "./courses/now_courses";
import { NATU_COURSES } from "./courses/natu_courses";
import { INFO_COURSES } from "./courses/info_courses";
import { INFO_B_COURSES } from "./courses/info_b_couses";
import { TECH_COURSES } from "./courses/tech_courses";
import { TECH_B_COURSES } from "./courses/tech_b_courses";
import { CIA_COURSES } from "./courses/cia_couses";
import { CIA_B_COURSES } from "./courses/cia_b_couses";
import { BIO_COURSES } from "./courses/bio_courses";
import { BIO_B_COURSES } from "./courses/bio_b_couses";
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

export type Entries = Partial<Record<CellKey, string>>;
export type Intensives = Partial<Record<Day, string>>;
export type Rooms = Partial<Record<CellKey, string>>;
export type IntensiveRooms = Partial<Record<Day, string>>;
export const DEPARTMENTS = [
  "医",
  "情報",
  "理",
  "工",
  "農",
  "文",
  "経済",
  "法",
  "全学",
] as const;
export type Department = (typeof DEPARTMENTS)[number];

export const isDepartment = (v: string): v is Department =>
  (DEPARTMENTS as readonly string[]).includes(v);

export const SECTIONS = ["現代教養", "自然教養", "専門基礎", "専門"] as const;
export type Section = (typeof SECTIONS)[number];

export const isSection = (v: string): v is Section =>
  (SECTIONS as readonly string[]).includes(v);

export const SEMESTERS = [
  "春1",
  "春2",
  "秋1",
  "秋2",
  "春集中",
  "秋集中",
] as const;
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
  ...BIO_B_COURSES,
  ...BIO_COURSES,
  ...CIA_B_COURSES,
  ...CIA_COURSES,
  ...INFO_B_COURSES,
  ...INFO_COURSES,
  ...NOW_COURSES,
  ...NATU_COURSES,
  ...TECH_B_COURSES,
  ...TECH_COURSES,
];
