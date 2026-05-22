"use client";

import { useEffect, useState } from "react";
import { AdminGuard } from "@/components/AdminGuard";
import { AdminWordForm } from "@/components/AdminWordForm";
import { AdminWordsTable } from "@/components/AdminWordsTable";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PageShell } from "@/components/ui/PageShell";
import { createSupabaseBrowserClient } from "@/lib/supabaseClient";
import { fetchAdminWords } from "@/lib/queries";
import type { GenkiWord, WordType } from "@/types/genki";

export type AdminFilters = {
  bookNumber: number;
  chapterNumber: number;
  wordType: WordType;
};

function AdminDashboard() {
  const [words, setWords] = useState<GenkiWord[]>([]);
  const [editing, setEditing] = useState<GenkiWord | null>(null);

  const [filters, setFilters] = useState<AdminFilters>({
    bookNumber: 1,
    chapterNumber: 1,
    wordType: "vocab",
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadWords(nextFilters = filters) {
    setLoading(true);
    setError("");

    try {
      const data = await fetchAdminWords(
        nextFilters.bookNumber,
        nextFilters.chapterNumber,
        nextFilters.wordType
      );

      setWords(data);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Could not load words."
      );
    } finally {
      setLoading(false);
    }
  }

  async function signOut() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    window.location.href = "/admin/login";
  }

  useEffect(() => {
    loadWords(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.bookNumber, filters.chapterNumber, filters.wordType]);

  const title = `Genki ${filters.bookNumber} · Chapter ${
    filters.chapterNumber
  } · ${filters.wordType === "vocab" ? "Vocab" : "Kanji"}`;

  return (
    <PageShell className="overflow-hidden py-3 sm:py-4 lg:py-5">
      <div className="mx-auto max-w-[920px]">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.35em] text-[#6d94d2]">
              Admin
            </p>

            <h1 className="mt-1.5 text-3xl font-black tracking-tight text-[#173763] sm:text-[34px] lg:text-[38px]">
              {title}
            </h1>
          </div>

          <Button
            variant="secondary"
            onClick={signOut}
            className="mt-4 shrink-0 px-4 py-2 text-xs sm:text-sm"
          >
            Sign out
          </Button>
        </div>

        {error ? (
          <Card className="mb-4 p-3 text-sm font-black text-rose-600">
            {error}
          </Card>
        ) : null}

        <div className="grid items-start justify-center gap-4 xl:grid-cols-[285px_minmax(0,1fr)] xl:justify-start">
          <AdminWordForm
            editing={editing}
            filters={filters}
            onFiltersChange={(nextFilters) => {
              setEditing(null);
              setFilters(nextFilters);
            }}
            onDone={() => {
              setEditing(null);
              loadWords(filters);
            }}
          />

          {loading ? (
            <Card className="w-full p-6 text-center text-lg font-black">
              Loading words...
            </Card>
          ) : (
            <AdminWordsTable
              words={words}
              wordType={filters.wordType}
              onEdit={(word) => {
                setEditing(word);
              }}
              onChanged={() => loadWords(filters)}
            />
          )}
        </div>
      </div>
    </PageShell>
  );
}

export default function AdminPage() {
  return (
    <AdminGuard>
      <AdminDashboard />
    </AdminGuard>
  );
}