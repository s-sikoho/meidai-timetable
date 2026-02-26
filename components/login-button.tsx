"use client";

import { useRouter } from "next/navigation";

export default function LoginButton() {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={() => router.push("/login")}
      style={{
        padding: "8px 12px",
        border: "1px solid #d1d5db",
        borderRadius: 8,
        background: "white",
        cursor: "pointer",
      }}
    >
      ログイン
    </button>
  );
}
