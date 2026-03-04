"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        router.replace("/");
        router.refresh();
      } else {
        router.replace("/login");
      }
    })();
  }, [router]);

  return <div className="p-4">確認中...</div>;
}
