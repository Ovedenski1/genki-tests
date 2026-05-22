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
      <PageShell className="flex flex-1 items-center justify-center">
        <Card className="w-full max-w-md p-8 text-center text-2xl font-black text-[#173763]">
          Checking...
        </Card>
      </PageShell>
    );
  }

  return (
    <PageShell className="flex flex-1 items-center justify-center">
      <Card className="w-full max-w-md p-8 sm:p-10 2xl:max-w-xl 2xl:p-12">
        <p className="text-base font-black uppercase tracking-[0.3em] text-[#6d94d2] 2xl:text-lg">
          Admin
        </p>

        <h1 className="mt-3 text-5xl font-black text-[#173763] 2xl:text-6xl">
          Sign in
        </h1>

        <form onSubmit={handleLogin} className="mt-8 grid gap-4 2xl:gap-5">
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />

          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />

          {error ? (
            <div className="rounded-xl bg-rose-50 p-4 font-black text-rose-700">
              {error}
            </div>
          ) : null}

          <Button disabled={loading} variant="blue">
            {loading ? "Signing in..." : "Sign in"}
          </Button>
        </form>
      </Card>
    </PageShell>
  );
}