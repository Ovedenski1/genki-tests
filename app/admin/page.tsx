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
import type { GenkiWord, KanjiMode, WordType } from "@/types/genki";

export type AdminFilters = {
  bookNumber: number;
  chapterNumber: number;
  wordType: WordType;
  kanjiMode: Exclude<KanjiMode, "all">;
};

function AdminDashboard() {
  const [words, setWords] = useState<GenkiWord[]>([]);
  const [editing, setEditing] = useState<GenkiWord | null>(null);

  const [filters, setFilters] = useState<AdminFilters>({
    bookNumber: 1,
    chapterNumber: 1,
    wordType: "vocab",
    kanjiMode: "vocab",
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
        nextFilters.wordType,
        nextFilters.wordType === "kanji" ? nextFilters.kanjiMode : "all"
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
  }, [
    filters.bookNumber,
    filters.chapterNumber,
    filters.wordType,
    filters.kanjiMode,
  ]);

  const typeLabel =
    filters.wordType === "vocab"
      ? "Vocab"
      : filters.kanjiMode === "back"
        ? "Kanji Back"
        : "Kanji Vocab";

  const title = `Genki ${filters.bookNumber} · Chapter ${filters.chapterNumber} · ${typeLabel}`;

  return (
    <PageShell className="overflow-hidden py-3 sm:py-4 lg:py-5">
      <div className="mx-auto w-full max-w-[1467px] origin-top scale-90">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.35em] text-[#6d94d2]">
              Admin
            </p>

            <h1 className="mt-1.5 text-3xl font-black tracking-tight text-[#173763] sm:text-[40px] lg:text-[48px]">
              {title}
            </h1>
          </div>

          <Button
            variant="secondary"
            onClick={signOut}
            className="mt-4 shrink-0 px-5 py-3 text-xs sm:text-sm"
          >
            Sign out
          </Button>
        </div>

        {error ? (
          <Card className="mb-4 p-3 text-sm font-black text-rose-600">
            {error}
          </Card>
        ) : null}

        <div className="grid items-stretch gap-5 xl:grid-cols-[380px_minmax(0,1fr)]">
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
            <Card className="flex h-[min(620px,calc(100svh-250px))] min-h-[520px] w-full items-center justify-center p-6 text-center text-lg font-black">
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