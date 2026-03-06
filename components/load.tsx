import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/lib/supabase/client";
import type { Entries, Intensives, Rooms, IntensiveRooms } from "@/lib/courses";

export default function LoadControls({
  setEntries,
  setIntensives,
  setRooms,
  setIntensiveRooms,
}: {
  setEntries: React.Dispatch<React.SetStateAction<Entries>>;
  setIntensives: React.Dispatch<React.SetStateAction<Intensives>>;
  setRooms: React.Dispatch<React.SetStateAction<Rooms>>;
  setIntensiveRooms: React.Dispatch<React.SetStateAction<IntensiveRooms>>;
}) {
  const [loadTerm, setLoadTerm] = React.useState<string>("");
  const [loading, setLoading] = React.useState(false);

  const handleLoad = async () => {
    if (!loadTerm) return;

    try {
      setLoading(true);

      const { data: auth, error: userErr } = await supabase.auth.getUser();
      if (userErr) throw userErr;
      if (!auth.user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("timetables")
        .select("entries,intensives,rooms,intensive_rooms")
        .eq("user_id", auth.user.id)
        .eq("term", loadTerm)
        .maybeSingle();

      if (error) throw error;

      setEntries((data?.entries ?? {}) as Entries);
      setIntensives((data?.intensives ?? {}) as Intensives);
      setRooms((data?.rooms ?? {}) as Rooms);
      setIntensiveRooms((data?.intensive_rooms ?? {}) as IntensiveRooms);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <React.Fragment>
      <Select value={loadTerm} onValueChange={setLoadTerm}>
        <SelectTrigger className="w-40">
          <SelectValue placeholder="読み込み先" />
        </SelectTrigger>
        <SelectContent>
          {Array.from({ length: 4 }, (_, i) => i + 1).flatMap((year) => [
            <SelectItem key={`${year}-spring`} value={`${year}-spring`}>
              {year}年-春
            </SelectItem>,
            <SelectItem key={`${year}-fall`} value={`${year}-fall`}>
              {year}年-秋
            </SelectItem>,
          ])}
        </SelectContent>
      </Select>

      <Button
        type="button"
        onClick={handleLoad}
        disabled={!loadTerm || loading}
      >
        {loading ? "読み込み中…" : "読み込み"}
      </Button>
    </React.Fragment>
  );
}
