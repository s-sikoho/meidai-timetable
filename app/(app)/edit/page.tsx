"use client";

import * as React from "react";
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
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  useDraggable,
  useDroppable,
  DragOverlay,
  DragCancelEvent,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import LoadControls from "@/components/load";
import { supabase } from "@/lib/supabase/client";

export default function TimetablePage() {
  const [entries, setEntries] = React.useState<Entries>({});
  const [intensives, setIntensives] = React.useState<Intensives>({});
  const [activeCell, setActiveCell] = React.useState<{
    day: Day;
    period: Period | "intensive";
  } | null>(null);
  const [openCellPicker, setOpenCellPicker] = React.useState(false);
  // ★ DragOverlay用：いま掴んでる授業ID
  const [activeCourseId, setActiveCourseId] = React.useState<string | null>(
    null,
  );
  const [dept, setDept] = React.useState<Department | null>(null);
  const [cell, setCell] = React.useState<CellKey | null>(null);
  const [seme, SetSeme] = React.useState<Semester | null>(null);
  const [saveopen, setSaveOpen] = React.useState(false);
  const [saveterm, setSaveTerm] = React.useState<string>("");
  const [saving, setSaving] = React.useState(false);
  const [authError, setAuthError] = React.useState<string | null>(null);

  const handleOpen = () => {
    setSaveTerm("");
    setSaveOpen(true);
  };

  async function onSave(
    term: string,
    entries: Entries,
    intensives: Intensives,
  ) {
    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser();
    if (userErr) throw userErr;
    if (!user) throw new Error("Not authenticated");

    const { error } = await supabase
      .from("timetables")
      .upsert(
        { user_id: user.id, term, entries, intensives },
        { onConflict: "user_id,term" },
      );

    if (error) throw error;
  }

  const handleConfirmSave = async () => {
    if (!saveterm) return;
    try {
      setSaving(true);
      await onSave(saveterm, entries, intensives);
      setSaveOpen(false);
    } catch (e: unknown) {
      console.error(e);
      setAuthError(
        e instanceof Error && e.message === "Auth session missing!"
          ? "ログイン情報が取得できませんでした"
          : "保存に失敗しました",
      );
      setSaveOpen(false);
    } finally {
      setSaving(false);
    }
  };
  const CLEAR_VALUE = "__CLEAR__" as const;

  const addToCell = React.useCallback(
    (day: Day, period: Period, courseId: string) => {
      const key = cellKey(day, period);
      setEntries((prev) => ({
        ...prev,
        [key]: courseId,
      }));
    },
    [],
  );

  const addIntensive = React.useCallback((day: Day, courseId: string) => {
    setIntensives((prev) => ({
      ...prev,
      [day]: courseId,
    }));
  }, []);

  const removeFromCell = React.useCallback((day: Day, period: Period) => {
    const key = cellKey(day, period);
    setEntries((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  const removeIntensive = React.useCallback((day: Day) => {
    setIntensives((prev) => {
      const next = { ...prev };
      delete next[day];
      return next;
    });
  }, []);

  const onDragStart = (event: DragStartEvent) => {
    setActiveCourseId(String(event.active.id));
  };

  const onDragCancel = (_event: DragCancelEvent) => {
    setActiveCourseId(null);
  };

  const onDragEnd = (event: DragEndEvent) => {
    const courseId = String(event.active.id);
    const overId = event.over?.id ? String(event.over.id) : null;

    setActiveCourseId(null);

    if (!overId) return;
    if (!overId.startsWith("cell:")) return;
    if (overId.startsWith("cell:intensive:")) {
      const day = overId.replace("cell:intensive:", "") as Day;
      addIntensive(day, courseId);
      return;
    }

    const key = overId.replace("cell:", "") as CellKey;
    const [day, periodStr] = key.split("-");
    const periodNum = Number(periodStr);
    if (!isPeriod(periodNum)) return;

    addToCell(day as Day, periodNum, courseId);
  };

  const activeCourse = activeCourseId
    ? (COURSES.find((c) => c.id === activeCourseId) ?? null)
    : null;

  return (
    <DndContext
      onDragStart={onDragStart}
      onDragCancel={onDragCancel}
      onDragEnd={onDragEnd}
    >
      <div className="flex gap-4 p-4">
        {/* 左：授業一覧 */}
        <div className="w-72 shrink-0">
          <div className="mb-2 grid grid-cols-2 gap-2">
            <Select
              value={dept ?? ""}
              onValueChange={(v) =>
                setDept(v === CLEAR_VALUE ? null : isDepartment(v) ? v : null)
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="学部" />
              </SelectTrigger>
              <SelectContent className="z-50">
                <SelectGroup>
                  <SelectItem value={CLEAR_VALUE}>指定なし</SelectItem>
                  {DEPARTMENTS.filter((d) => d !== "全学").map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}学部
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            <div />
            <Select
              value={seme ?? ""}
              onValueChange={(v) =>
                SetSeme(v === CLEAR_VALUE ? null : isSemester(v) ? v : null)
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="学期" />
              </SelectTrigger>
              <SelectContent className="z-50">
                <SelectGroup>
                  <SelectItem value={CLEAR_VALUE}>指定なし</SelectItem>
                  {SEMESTERS.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            <Select
              value={cell ?? ""}
              onValueChange={(v) =>
                setCell(v === CLEAR_VALUE ? null : isCellKey(v) ? v : null)
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="コマ" />
              </SelectTrigger>
              <SelectContent className="z-50">
                <SelectGroup>
                  <SelectItem value={CLEAR_VALUE}>指定なし</SelectItem>
                  {CELL_KEYS.map((item) => (
                    <SelectItem key={item.key} value={item.key}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <Accordion type="single" collapsible className="space-y-2">
            {SECTIONS.map((section) => (
              <AccordionItem key={section} value={section}>
                <AccordionTrigger>{section}</AccordionTrigger>
                <AccordionContent>
                  <ScrollArea className="h-90 pr-3">
                    <div className="space-y-2">
                      {COURSES.filter((c) => c.section === section)
                        .filter((c) => {
                          if (!dept) return true; // dept未選択なら全部
                          if (c.department === "全学") return true; // 授業側にdepartmentが無いなら全部出す
                          return c.department === dept; // departmentがある授業だけ一致判定
                        })
                        .filter((c) => (seme ? c.semester === seme : true))
                        .filter((c) => (cell ? c.cellKey === cell : true))
                        .map((item) => (
                          <CourseDraggable key={item.id} course={item} />
                        ))}
                    </div>
                  </ScrollArea>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* 右：時間割 */}
        <div className="flex-1">
          <div className="space-y-3">
            <div className="grid grid-cols-6 gap-2">
              {/* ヘッダー行 */}
              <div />
              {DAYS.map((d) => (
                <div key={d.key} className="text-center text-sm font-medium">
                  {d.label}
                </div>
              ))}
              {/* グリッド本体 */}
              {PERIODS.map((p) => (
                <React.Fragment key={p}>
                  <div className="flex items-center justify-center text-sm font-medium">
                    {p}限
                  </div>

                  {DAYS.map((d) => {
                    const key = cellKey(d.key, p);
                    const courseId = entries[key];
                    const course = courseId
                      ? COURSES.find((x) => x.id === courseId)
                      : null;

                    return (
                      <TimetableCell
                        key={key}
                        id={`cell:${key}`}
                        day={d.key}
                        period={p}
                        courseTitle={course?.title ?? null}
                        courseSection={course?.section ?? null}
                        courseTeacher={course?.teacher ?? null}
                        onClick={() => {
                          setActiveCell({ day: d.key, period: p });
                          setOpenCellPicker(true);
                        }}
                        onClear={() => removeFromCell(d.key, p)}
                      />
                    );
                  })}
                </React.Fragment>
              ))}
              {/* ★追加：少し離して「集中」行 */}
              <div className="col-span-6 mt-3" /> {/* 余白だけの行（任意） */}
              <React.Fragment key="intensive">
                <div className="flex items-center justify-center text-sm font-medium">
                  集中
                </div>

                {DAYS.map((d) => {
                  // 集中セル用のID（droppable用）。cellKey型とは別なので文字列でOK
                  const id = `cell:intensive:${d.key}`;
                  const courseId = intensives[d.key];
                  const course = courseId
                    ? COURSES.find((x) => x.id === courseId)
                    : null;

                  return (
                    <TimetableCell
                      key={id}
                      id={id}
                      day={d.key}
                      period="intensive" // 表示/aria用に必要なら別propsにするのが理想
                      courseTitle={course?.title ?? null}
                      courseSection={course?.section ?? null}
                      courseTeacher={course?.teacher ?? null}
                      onClick={() => {
                        setActiveCell({ day: d.key, period: "intensive" });
                        setOpenCellPicker(true);
                      }}
                      onClear={() => removeIntensive(d.key)}
                    />
                  );
                })}
              </React.Fragment>
            </div>

            {/* クリック追加：セル用の選択メニュー */}
            <Popover open={openCellPicker} onOpenChange={setOpenCellPicker}>
              <PopoverTrigger asChild>
                <span />
              </PopoverTrigger>

              <PopoverContent className="w-80 p-0" align="center">
                <Command>
                  <CommandInput placeholder="授業を検索…" />
                  <CommandEmpty>見つかりません</CommandEmpty>
                  <CommandGroup heading="授業">
                    <ScrollArea className="h-90 pr-3">
                      {COURSES.filter((c) => {
                        if (!activeCell) return false;
                        if (activeCell.period === "intensive") {
                          return (
                            c.semester === "春集中" || c.semester === "秋集中"
                          );
                        }
                        return (
                          c.cellKey != null &&
                          c.cellKey ===
                            cellKey(activeCell.day, activeCell.period)
                        );
                      }).map((c) => (
                        <CommandItem
                          key={c.id}
                          value={`${c.title}__${c.id}`}
                          onSelect={() => {
                            if (!activeCell) return;
                            if (activeCell.period === "intensive") {
                              addIntensive(activeCell.day, c.id);
                              setOpenCellPicker(false);
                              return;
                            }
                            addToCell(activeCell.day, activeCell.period, c.id);
                            setOpenCellPicker(false);
                          }}
                          className={cn(
                            "!rounded-none", // ★丸み消す（確実に）
                            "border-b border-border",
                            "overflow-hidden", // これは残してOK（不要なら消しても可）

                            c.section === "言語教養" && "bg-pink-100",
                            c.section === "自然教養" && "bg-sky-100",
                            c.section === "専門基礎" && "bg-purple-100",
                            c.section === "専門" && "bg-orange-100",

                            "data-[selected=true]:ring-2 data-[selected=true]:ring-primary data-[selected=true]:ring-inset",
                            "hover:ring-2 hover:ring-primary hover:ring-inset",
                            "data-[selected=true]:!bg-transparent hover:!bg-transparent",
                          )}
                        >
                          {c.title}:{c.teacher ? c.teacher : ""}
                        </CommandItem>
                      ))}
                    </ScrollArea>
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
            <div className="relative flex justify-end gap-2">
              <LoadControls
                setEntries={setEntries}
                setIntensives={setIntensives}
              />
              <Button type="button" onClick={handleOpen}>
                保存
              </Button>

              {/* 保存先選択ダイアログ */}
              <Dialog open={saveopen} onOpenChange={setSaveOpen}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>保存先を選択</DialogTitle>
                  </DialogHeader>

                  <div className="space-y-2">
                    <Select value={saveterm} onValueChange={setSaveTerm}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="例：1年-春 / 2年-秋" />
                      </SelectTrigger>

                      <SelectContent>
                        {Array.from({ length: 4 }, (_, i) => i + 1).flatMap(
                          (year) => [
                            <SelectItem
                              key={`${year}-spring`}
                              value={`${year}-spring`}
                            >
                              {year}年-春
                            </SelectItem>,
                            <SelectItem
                              key={`${year}-fall`}
                              value={`${year}-fall`}
                            >
                              {year}年-秋
                            </SelectItem>,
                          ],
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <DialogFooter className="gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setSaveOpen(false)}
                    >
                      キャンセル
                    </Button>
                    <Button
                      type="button"
                      onClick={handleConfirmSave}
                      disabled={!saveterm || saving}
                    >
                      {saving ? "保存中..." : "この保存先で保存"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              {authError && (
                <div className="absolute -bottom-6 right-0 text-sm text-red-600">
                  {authError}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/*ドラッグ中はファイルアイコンで小さく*/}
      <DragOverlay dropAnimation={null}>
        {activeCourse ? <DraggingFileChip title={activeCourse.title} /> : null}
      </DragOverlay>
    </DndContext>
  );
}

function CourseDraggable({ course }: { course: Course }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: course.id,
    });

  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.35 : 1,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={cn(
        "cursor-grab select-none rounded-md p-3 active:cursor-grabbing",
        course.section === "言語教養" && "bg-pink-100",
        course.section === "自然教養" && "bg-sky-100",
        course.section === "専門基礎" && "bg-purple-100",
        course.section === "専門" && "bg-orange-100",
      )}
      {...listeners}
      {...attributes}
    >
      <div className="text-sm font-medium">{course.title}</div>
      <div className="text-xs text-muted-foreground">
        {course.teacher ? course.teacher : "教官不明"}
      </div>
    </Card>
  );
}

function TimetableCell({
  id,
  day,
  period,
  courseTitle,
  courseSection,
  courseTeacher,
  onClick,
  onClear,
}: {
  id: string;
  day: Day;
  period: number | "intensive";
  courseTitle: string | null;
  courseSection: string | null;
  courseTeacher: string | null;
  onClick: () => void;
  onClear: () => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id });
  const ellipsis = (s: string, n = 7) => {
    const arr = Array.from(s); // 日本語でも崩れにくい
    return arr.length > n ? arr.slice(0, n).join("") + "…" : s;
  };

  return (
    <Card
      ref={setNodeRef}
      className={cn(
        "relative h-20 rounded-md p-2 pr-8 cursor-pointer transition overflow-hidden", // ★pr-8 + overflow-hidden
        isOver && "ring-2 ring-primary",
        courseSection === "言語教養" && "bg-pink-100",
        courseSection === "自然教養" && "bg-sky-100",
        courseSection === "専門基礎" && "bg-purple-100",
        courseSection === "専門" && "bg-orange-100",
      )}
      onClick={onClick}
      role="button"
      aria-label={`${day} ${period}限`}
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

          <Button
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1 h-7 px-2"
            onClick={(e) => {
              e.stopPropagation();
              onClear();
            }}
          >
            ×
          </Button>
        </>
      ) : (
        <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
          ここにドロップ / クリックで追加
        </div>
      )}
    </Card>
  );
}

/**
 * DragOverlayで表示する「小さいファイルアイコン」の見た目
 */
function DraggingFileChip({ title }: { title: string }) {
  return (
    <div className="pointer-events-none">
      <div className="flex w-40 items-center gap-2 rounded-md border bg-background px-3 py-2 shadow">
        <FileText className="h-4 w-4" />
        <div className="min-w-0">
          <div className="truncate text-sm font-medium">{title}</div>
          <div className="text-[11px] text-muted-foreground">移動中…</div>
        </div>
      </div>
    </div>
  );
}
