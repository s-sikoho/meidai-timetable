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
// 時間割の配置（cell -> courseId）
type Entries = Partial<Record<CellKey, string>>;

export default function TimetablePage() {
  const [entries, setEntries] = React.useState<Entries>({});
  const [activeCell, setActiveCell] = React.useState<{
    day: Day;
    period: Period;
  } | null>(null);
  const [openCellPicker, setOpenCellPicker] = React.useState(false);
  // ★ DragOverlay用：いま掴んでる授業ID
  const [activeCourseId, setActiveCourseId] = React.useState<string | null>(
    null,
  );
  const [dept, setDept] = React.useState<Department | null>(null);
  const [cell, setCell] = React.useState<CellKey | null>(null);
  const [seme, SetSeme] = React.useState<Semester | null>(null);
  const CLEAR_VALUE = "__CLEAR__" as const;

  const addToCell = React.useCallback(
    (day: Day, period: Period, courseId: string) => {
      const key = cellKey(day, period);
      setEntries((prev) => ({
        ...prev,
        [key]: courseId, // 仕様：上書き
      }));
    },
    [],
  );

  const removeFromCell = React.useCallback((day: Day, period: Period) => {
    const key = cellKey(day, period);
    setEntries((prev) => {
      const next = { ...prev };
      delete next[key];
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

    // どこにも落とさなかった場合も overlay は消す
    setActiveCourseId(null);

    if (!overId) return;
    if (!overId.startsWith("cell:")) return;

    const key = overId.replace("cell:", "") as CellKey;
    const [day, periodStr] = key.split("-");
    const periodNum = Number(periodStr);
    if (!isPeriod(periodNum)) return; // ★追加

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
          <div className="mb-2 text-sm font-medium">時間割（1〜5限）</div>

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
                  <ScrollArea className="h-40 pr-3">
                    {COURSES.filter(
                      (c) =>
                        c.cellKey != null &&
                        activeCell != null &&
                        c.cellKey ===
                          cellKey(activeCell.day, activeCell.period),
                    )
                      .filter((c) => {
                        if (!dept) return true;
                        if (c.department === "全学") return true;
                        return c.department === dept;
                      })
                      .filter((c) => (seme ? c.semester === seme : true))
                      .map((c) => (
                        <CommandItem
                          key={c.id}
                          value={c.title}
                          onSelect={() => {
                            if (!activeCell) return;
                            addToCell(activeCell.day, activeCell.period, c.id);
                            setOpenCellPicker(false);
                          }}
                        >
                          {c.title}:{c.teacher ? c.teacher : ""}
                        </CommandItem>
                      ))}
                  </ScrollArea>
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* ★ここが「ドラッグ中はファイルアイコンで小さく」の本体 */}
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
  onClick,
  onClear,
}: {
  id: string;
  day: Day;
  period: number;
  courseTitle: string | null;
  onClick: () => void;
  onClear: () => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <Card
      ref={setNodeRef}
      className={[
        "relative h-20 rounded-md p-2",
        "cursor-pointer transition",
        isOver ? "ring-2 ring-primary" : "",
      ].join(" ")}
      onClick={onClick}
      role="button"
      aria-label={`${day} ${period}限`}
    >
      {courseTitle ? (
        <>
          <div className="text-sm font-semibold">{courseTitle}</div>
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
 * - “カード本体”とは別物なので、ドラッグ中の見た目を自由にデザインできる
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
