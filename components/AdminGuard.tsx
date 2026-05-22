"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabaseClient";
import { Card } from "@/components/ui/Card";
import { PageShell } from "@/components/ui/PageShell";

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const [checking, setChecking] = useState(true);
  const [allowed, setAllowed] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function check() {
      try {
        const supabase = createSupabaseBrowserClient();

        const { data: userData, error: userError } =
          await supabase.auth.getUser();

        if (userError || !userData.user) {
          router.replace("/admin/login");
          return;
        }

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", userData.user.id)
          .maybeSingle();

        if (profileError) {
          setError(profileError.message);
          setChecking(false);
          return;
        }

        if (profile?.role !== "admin") {
          await supabase.auth.signOut();
          router.replace("/admin/login");
          return;
        }

        setAllowed(true);
        setChecking(false);
      } catch {
        setError("Could not check admin access.");
        setChecking(false);
      }
    }

    check();
  }, [router]);

  if (checking) {
    return (
      <PageShell>
        <Card className="mx-auto max-w-xl p-10 text-center text-2xl font-black">
          Checking admin...
        </Card>
      </PageShell>
    );
  }

  if (error) {
    return (
      <PageShell>
        <Card className="mx-auto max-w-xl p-10 text-center">
          <h1 className="text-3xl font-black text-[#173763]">
            Admin check failed
          </h1>

          <p className="mt-4 font-bold text-rose-600">
            {error}
          </p>
        </Card>
      </PageShell>
    );
  }

  if (!allowed) return null;

  return <>{children}</>;
}