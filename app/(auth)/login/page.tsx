"use client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
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
        <form>
          <div className="flex flex-col gap-6">
            {/* ここに移動 */}
            <div className="text-left">
              <Button variant="link" className="p-0 h-auto justify-start">
                Sign Up
              </Button>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
              />
            </div>

            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
                <a
                  href="#"
                  className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                >
                  Forgot your password?
                </a>
              </div>
              <Input id="password" type="password" required />
            </div>

            <Button type="submit" className="w-full">
              Login
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
