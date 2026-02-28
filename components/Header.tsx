"use client";
import { useState } from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase/client";

export default function Header({ leftSlot }: { leftSlot?: React.ReactNode }) {
  const router = useRouter();
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [isAuthed, setIsAuthed] = useState(false);

  useEffect(() => {
    // 初期取得
    supabase.auth
      .getSession()
      .then(({ data }) => {
        setIsAuthed(!!data.session);
      })
      .finally(() => setLoadingAuth(false));

    // 状態変化を購読
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthed(!!session);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  const onLogout = async () => {
    await supabase.auth.signOut();
    // どこへ飛ばすかは好み
    router.push("/");
    router.refresh();
  };

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
        {/* 読み込み中はボタンを無効化（チラつき対策） */}
        {isAuthed ? (
          <Button
            variant="outline"
            type="button"
            onClick={onLogout}
            disabled={loadingAuth}
            className="rounded-md border px-3 py-2 text-sm"
          >
            ログアウト
          </Button>
        ) : (
          <Button
            variant="outline"
            type="button"
            onClick={() => router.push("/login")}
            disabled={loadingAuth}
            className="rounded-md border px-3 py-2 text-sm"
          >
            ログイン
          </Button>
        )}
      </div>
    </header>
  );
}
