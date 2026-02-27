"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  async function onSignUp() {
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        setError(error.message);
        return;
      }

      if (!data.session) {
        setMessage(
          "確認メールを送信しました。メールのリンクを開いて登録を完了してください。",
        );
        return;
      }

      router.push("/me");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-4">
        <div className="text-xl font-semibold">Create account</div>
        <div className="text-sm text-muted-foreground">
          Enter your email and password to sign up.
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSignUp();
          }}
        >
          <div className="flex flex-col gap-6">
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
              {loading ? "Loading..." : "Sign Up"}
            </Button>
          </div>
        </form>

        <Button asChild variant="link" className="p-0 h-auto cursor-pointer">
          <Link href="/login">Back to login</Link>
        </Button>
      </div>
    </div>
  );
}
