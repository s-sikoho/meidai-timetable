"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function Header({ leftSlot }: { leftSlot?: React.ReactNode }) {
  const router = useRouter();

  return (
    <header className="flex h-14 items-center gap-2 border-b px-4">
      {/* left: sidebar trigger etc. */}
      {leftSlot}

      <div
        className="cursor-pointer font-semibold"
        onClick={() => router.push("/")}
      >
        Timetable
      </div>

      {/* right */}
      <div className="ml-auto flex items-center gap-2">
        <Button
          variant="outline"
          type="button"
          onClick={() => router.push("/login")}
          className="rounded-md border px-3 py-2 text-sm"
        >
          ログイン
        </Button>
      </div>
    </header>
  );
}
