"use client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    // ログイン成功 → 自分のページへ
    router.push("/me");
    router.refresh();
  }
  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      <Button
        type="button"
        variant="ghost"
        className="absolute top-4 left-4"
        onClick={() => {
          router.push("/");
        }}
      >
        timetable
      </Button>
      <div className="w-full max-w-sm space-y-4">
        <div className="space-y-1">
          <div className="text-xl font-semibold">Login to your account</div>
          <div className="text-sm text-muted-foreground">
            Enter your email below to login to your account
          </div>
        </div>
        <form onSubmit={onLogin}>
          <div className="flex flex-col gap-6">
            {/* ここに移動 */}
            <div className="text-left">
              <Button
                asChild
                variant="link"
                className="p-0 h-auto justify-start cursor-pointer"
              >
                <Link href="/signup">Create account</Link>
              </Button>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
                <a
                  href="/forgot"
                  className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  onClick={(e) => e.preventDefault()}
                >
                  Forgot your password?
                </a>
              </div>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && <div className="text-sm text-red-600">{error}</div>}
            {message && <div className="text-sm text-green-700">{message}</div>}

            <Button
              type="submit"
              className="w-full cursor-pointer"
              disabled={loading}
            >
              {loading ? "Loading..." : "Login"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
