"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { PageShell } from "@/components/ui/PageShell";
import { createSupabaseBrowserClient } from "@/lib/supabaseClient";

function withTimeout<T>(task: PromiseLike<T>, milliseconds = 15000): Promise<T> {
  return Promise.race([
    Promise.resolve(task),
    new Promise<T>((_, reject) => {
      window.setTimeout(() => {
        reject(
          new Error(
            "Login timed out. Check Supabase URL, key, and internet connection."
          )
        );
      }, milliseconds);
    }),
  ]);
}

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    async function checkExistingSession() {
      try {
        const supabase = createSupabaseBrowserClient();

        const { data: userData } = await supabase.auth.getUser();

        if (!userData.user) {
          setCheckingSession(false);
          return;
        }

        const profileResponse = await withTimeout(
          supabase
            .from("profiles")
            .select("role")
            .eq("id", userData.user.id)
            .maybeSingle()
        );

        if (profileResponse.data?.role === "admin") {
          router.replace("/admin");
          return;
        }

        await supabase.auth.signOut();
        setCheckingSession(false);
      } catch {
        setCheckingSession(false);
      }
    }

    checkExistingSession();
  }, [router]);

  async function handleLogin(event: React.FormEvent) {
    event.preventDefault();

    setLoading(true);
    setError("");

    try {
      const supabase = createSupabaseBrowserClient();

      const loginResponse = await withTimeout(
        supabase.auth.signInWithPassword({
          email,
          password,
        })
      );

      if (loginResponse.error || !loginResponse.data.user) {
        setError(loginResponse.error?.message || "Invalid login.");
        setLoading(false);
        return;
      }

      const profileResponse = await withTimeout(
        supabase
          .from("profiles")
          .select("role")
          .eq("id", loginResponse.data.user.id)
          .maybeSingle()
      );

      if (profileResponse.error) {
        await supabase.auth.signOut();
        setError(profileResponse.error.message);
        setLoading(false);
        return;
      }

      if (profileResponse.data?.role !== "admin") {
        await supabase.auth.signOut();
        setError("This account is not admin.");
        setLoading(false);
        return;
      }

      router.replace("/admin");
      router.refresh();
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Could not connect to Supabase."
      );
      setLoading(false);
    }
  }

  if (checkingSession) {
    return (
      <PageShell className="flex flex-1 items-center justify-center py-4">
        <Card className="w-full max-w-sm p-6 text-center text-xl font-black text-[#173763]">
          Checking...
        </Card>
      </PageShell>
    );
  }

  return (
    <PageShell className="flex flex-1 items-center justify-center py-4 sm:py-5 lg:py-6">
      <Card className="w-full max-w-sm p-6 sm:p-7">
        <p className="text-sm font-black uppercase tracking-[0.3em] text-[#6d94d2]">
          Admin
        </p>

        <h1 className="mt-2 text-4xl font-black text-[#173763]">
          Sign in
        </h1>

        <form onSubmit={handleLogin} className="mt-6 grid gap-3">
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            className="h-11 px-4 py-2 text-sm"
          />

          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            className="h-11 px-4 py-2 text-sm"
          />

          {error ? (
            <div className="rounded-xl bg-rose-50 p-3 text-sm font-black text-rose-700">
              {error}
            </div>
          ) : null}

          <Button disabled={loading} variant="blue" className="py-2.5 text-sm">
            {loading ? "Signing in..." : "Sign in"}
          </Button>
        </form>
      </Card>
    </PageShell>
  );
}