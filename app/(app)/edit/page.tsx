"use client";

import * as React from "react";
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

type Day = "Mon" | "Tue" | "Wed" | "Thu" | "Fri";
const DAYS: { key: Day; label: string }[] = [
  { key: "Mon", label: "月" },
  { key: "Tue", label: "火" },
  { key: "Wed", label: "水" },
  { key: "Thu", label: "木" },
  { key: "Fri", label: "金" },
];
const PERIODS = [1, 2, 3, 4, 5] as const;

type course_section = "言語教養" | "自然教養" | "専門基礎" | "専門";
type Course = {
  id: string;
  title: string;
  department: string;
  section: course_section;
};
type CellKey = `${Day}-${number}`;

const DEPARTMENTS: string[] = ["医", "情報", "理", "工", "文", "経済", "法"];
const SECTIONS: course_section[] = ["言語教養", "自然教養", "専門基礎", "専門"];
const COURSES: Course[] = [
  { id: "c1", title: "線形代数", department: "情報", section: "自然教養" },
  { id: "c2", title: "確率統計", department: "情報", section: "専門" },
  { id: "c3", title: "データ構造", department: "情報", section: "専門" },
  {
    id: "c4",
    title: "オペレーティングシステム",
    department: "情報",
    section: "専門",
  },
  { id: "c5", title: "英語", department: "情報", section: "言語教養" },
];

function cellKey(day: Day, period: number): CellKey {
  return `${day}-${period}` as const;
}

// 時間割の配置（cell -> courseId）
type Entries = Record<CellKey, string | undefined>;

export default function TimetablePage() {
  const [entries, setEntries] = React.useState<Entries>({});
  const [activeCell, setActiveCell] = React.useState<{
    day: Day;
    period: number;
  } | null>(null);
  const [openCellPicker, setOpenCellPicker] = React.useState(false);
  // ★ DragOverlay用：いま掴んでる授業ID
  const [activeCourseId, setActiveCourseId] = React.useState<string | null>(
    null,
  );
  const [dept, setDept] = React.useState<string | null>(null);

  const addToCell = React.useCallback(
    (day: Day, period: number, courseId: string) => {
      const key = cellKey(day, period);
      setEntries((prev) => ({
        ...prev,
        [key]: courseId, // 仕様：上書き
      }));
    },
    [],
  );

  const removeFromCell = React.useCallback((day: Day, period: number) => {
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
    const period = Number(periodStr);
    addToCell(day as Day, period, courseId);
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
          <div className="mb-2">
            <Select
              value={dept ?? ""}
              onValueChange={(v) => setDept(v || null)}
            >
              <SelectTrigger className="w-full max-w-48">
                <SelectValue placeholder="授業一覧（学部）" />
              </SelectTrigger>
              <SelectContent className="z-50">
                <SelectGroup>
                  {DEPARTMENTS.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}学部
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
                  <ScrollArea className="h-108 pr-3">
                    <div className="space-y-2">
                      {COURSES.filter((c) => c.section === section)
                        .filter((c) => (dept ? c.department === dept : true))
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
                  {COURSES.map((c) => (
                    <CommandItem
                      key={c.id}
                      value={c.title}
                      onSelect={() => {
                        if (!activeCell) return;
                        addToCell(activeCell.day, activeCell.period, c.id);
                        setOpenCellPicker(false);
                      }}
                    >
                      {c.title}
                    </CommandItem>
                  ))}
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
      className="cursor-grab select-none rounded-md p-3 active:cursor-grabbing"
      {...listeners}
      {...attributes}
    >
      <div className="text-sm font-medium">{course.title}</div>
      <div className="text-xs text-muted-foreground">ドラッグして配置</div>
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
