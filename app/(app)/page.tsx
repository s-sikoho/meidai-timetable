"use client";
import React, {
  Fragment,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  DAYS,
  PERIODS,
  CELL_KEYS,
  DEPARTMENTS,
  SECTIONS,
  SEMESTERS,
  COURSES,
  isCellKey,
  isDepartment,
  isSemester,
  isPeriod,
  cellKey,
  type Day,
  type Period,
  type CellKey,
  type Course,
  type Department,
  type Semester,
  type Entries,
  type Intensives,
} from "@/lib/courses";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import LoadControls from "@/components/load";

export default function Home() {
  const [entries, setEntries] = useState<Entries>({});
  const [intensives, setIntensives] = useState<Intensives>({});

  // 盤面の「基準幅」を決める（ここでデザインの元サイズを固定）
  // 左列 56px + 曜日列 5 * 120px = 656px（好みで調整OK）
  const BOARD_BASE_WIDTH = 56 + 5 * 120; // 656

  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [scale, setScale] = useState(1);

  useLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el) return;

    const ro = new ResizeObserver(() => {
      const w = el.clientWidth;
      // スマホでは「画面幅に収まるよう縮小」、PCでは等倍(最大1)
      const s = Math.min(1, w / BOARD_BASE_WIDTH);
      setScale(s);
    });

    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <main className="mx-auto w-full max-w-3xl bg-white px-4 py-6 dark:bg-black sm:px-8 sm:py-10">
      <div className="flex flex-col gap-3">
        <div className="flex justify-end">
          <div className="inline-flex items-center gap-2">
            <LoadControls
              setEntries={setEntries}
              setIntensives={setIntensives}
            />
          </div>
        </div>

        {/* ビューポート幅に合わせて盤面を縮小する枠 */}
        <div ref={wrapRef} className="w-full">
          {/* transform で縮小。縮小してもレイアウト上は基準幅分の高さを取らないように工夫 */}
          <div
            style={{
              width: BOARD_BASE_WIDTH,
              transform: `scale(${scale})`,
              transformOrigin: "top left",
            }}
            className="will-change-transform"
          >
            {/* グリッド本体（基準幅で設計） */}
            <div className="grid gap-2 [grid-template-columns:56px_repeat(5,120px)]">
              {/* ヘッダー行 */}
              <div />
              {DAYS.map((d) => (
                <div
                  key={d.key}
                  className="text-center text-xs font-medium sm:text-sm"
                >
                  {d.label}
                </div>
              ))}

              {/* 1〜5限 */}
              {PERIODS.map((p) => (
                <Fragment key={p}>
                  <div className="flex items-center justify-center text-xs font-medium sm:text-sm">
                    {p}限
                  </div>

                  {DAYS.map((d) => {
                    const key = cellKey(d.key, p);
                    const courseId = entries[key];
                    const course = courseId
                      ? COURSES.find((x) => x.id === courseId)
                      : null;

                    return (
                      <ViewTimetableCell
                        key={key}
                        id={`cell:${key}`}
                        day={d.key}
                        period={p}
                        courseTitle={course?.title ?? null}
                        courseSection={course?.section ?? null}
                        courseTeacher={course?.teacher ?? null}
                      />
                    );
                  })}
                </Fragment>
              ))}

              {/* 少し空ける行（見た目用） */}
              <div className="col-span-6 h-2" />

              {/* 集中 */}
              <Fragment key="intensive">
                <div className="flex items-center justify-center text-xs font-medium sm:text-sm">
                  集中
                </div>

                {DAYS.map((d) => {
                  const id = `cell:intensive:${d.key}`;
                  const courseId = intensives[d.key];
                  const course = courseId
                    ? COURSES.find((x) => x.id === courseId)
                    : null;

                  return (
                    <ViewTimetableCell
                      key={id}
                      id={id}
                      day={d.key}
                      period="intensive"
                      courseTitle={course?.title ?? null}
                      courseSection={course?.section ?? null}
                      courseTeacher={course?.teacher ?? null}
                    />
                  );
                })}
              </Fragment>
            </div>
          </div>

          {/* 縮小した分の「見た目高さ」に合わせて下の余白を自動で調整（重要） */}
          <div style={{ height: 0, paddingBottom: `${(1 - scale) * 0}px` }} />
        </div>
      </div>
    </main>
  );
}

function ViewTimetableCell({
  id,
  day,
  period,
  courseTitle,
  courseSection,
  courseTeacher,
}: {
  id: string;
  day: Day;
  period: number | "intensive";
  courseTitle: string | null;
  courseSection: string | null;
  courseTeacher: string | null;
}) {
  const ellipsis = (s: string, n = 7) => {
    const arr = Array.from(s); // 日本語でも崩れにくい
    return arr.length > n ? arr.slice(0, n).join("") + "…" : s;
  };

  return (
    <Card
      className={cn(
        "relative aspect-square w-full rounded-md p-2 pr-8 cursor-pointer transition overflow-hidden",
        courseSection === "現代教養" && "bg-pink-100",
        courseSection === "自然教養" && "bg-sky-100",
        courseSection === "専門基礎" && "bg-purple-100",
        courseSection === "専門" && "bg-orange-100",
      )}
    >
      {courseTitle ? (
        <>
          <div className="text-xs font-medium leading-snug">
            {ellipsis(courseTitle, 7)}
          </div>
          {courseTeacher ? (
            <div className="mt-0.5 text-[11px] leading-snug text-muted-foreground truncate">
              {courseTeacher}
            </div>
          ) : null}
        </>
      ) : (
        <div></div>
      )}
    </Card>
  );
}
