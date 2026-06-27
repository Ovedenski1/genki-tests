"use client";

import { useEffect, useMemo, useState } from "react";
import { AdminGlobalSearchModal, SearchIcon } from "@/components/AdminGlobalSearchModal";
import { AdminGuard } from "@/components/AdminGuard";
import { AdminWordForm } from "@/components/AdminWordForm";
import { AdminWordsTable } from "@/components/AdminWordsTable";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PageShell } from "@/components/ui/PageShell";
import { createSupabaseBrowserClient } from "@/lib/supabaseClient";
import {
  createStudyList,
  fetchAdminWords,
  fetchStudyLists,
} from "@/lib/queries";
import type {
  AdminEntryType,
  AdminWordSearchResult,
  GenkiWord,
  KanjiMode,
  StudyList,
} from "@/types/genki";

export type AdminFilters = {
  bookNumber: number;
  chapterNumber: number;
  entryType: AdminEntryType;
  kanjiMode: Exclude<KanjiMode, "all">;
  studyListId: string | null;
};

function AdminDashboard() {
  const [words, setWords] = useState<GenkiWord[]>([]);
  const [studyLists, setStudyLists] = useState<StudyList[]>([]);
  const [editing, setEditing] = useState<GenkiWord | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);

  const [filters, setFilters] = useState<AdminFilters>({
    bookNumber: 1,
    chapterNumber: 1,
    entryType: "vocab",
    kanjiMode: "vocab",
    studyListId: null,
  });

  const [loading, setLoading] = useState(true);
  const [listsLoading, setListsLoading] = useState(true);
  const [error, setError] = useState("");

  const selectedStudyList = useMemo(
    () => studyLists.find((list) => list.id === filters.studyListId) || null,
    [studyLists, filters.studyListId]
  );

  async function loadStudyLists(nextFilters = filters) {
    setListsLoading(true);

    try {
      const lists = await fetchStudyLists(
        nextFilters.bookNumber,
        nextFilters.chapterNumber
      );

      setStudyLists(lists);
    } catch {
      setStudyLists([]);
    } finally {
      setListsLoading(false);
    }
  }

  async function loadWords(nextFilters = filters) {
    setLoading(true);
    setError("");

    try {
      const wordType = nextFilters.entryType === "kanji" ? "kanji" : "vocab";
      const studyListId =
        nextFilters.entryType === "extra" ? nextFilters.studyListId : null;

      const data = await fetchAdminWords(
        nextFilters.bookNumber,
        nextFilters.chapterNumber,
        wordType,
        nextFilters.entryType === "kanji" ? nextFilters.kanjiMode : "all",
        studyListId
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

  async function handleCreateStudyList(name: string) {
    const newList = await createStudyList({
      book_number: filters.bookNumber,
      chapter_number: filters.chapterNumber,
      name,
      sort_order: studyLists.length + 1,
    });

    const lists = await fetchStudyLists(
      filters.bookNumber,
      filters.chapterNumber
    );

    setStudyLists(lists);

    setEditing(null);
    setFilters((old) => ({
      ...old,
      entryType: "extra",
      studyListId: newList.id,
    }));

    await loadWords({
      ...filters,
      entryType: "extra",
      studyListId: newList.id,
    });

    return newList;
  }

  async function handleOpenSearchResult(result: AdminWordSearchResult) {
    const word = result.word;

    const nextEntryType: AdminEntryType =
      word.word_type === "kanji"
        ? "kanji"
        : word.study_list_id
          ? "extra"
          : "vocab";

    const nextFilters: AdminFilters = {
      bookNumber: word.book_number,
      chapterNumber: word.chapter_number,
      entryType: nextEntryType,
      kanjiMode: word.kanji_mode === "back" ? "back" : "vocab",
      studyListId: nextEntryType === "extra" ? word.study_list_id || null : null,
    };

    setSearchOpen(false);
    setFilters(nextFilters);
    setEditing(word);

    await loadStudyLists(nextFilters);
    await loadWords(nextFilters);
  }

  async function signOut() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    window.location.href = "/admin/login";
  }

  useEffect(() => {
    loadStudyLists(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.bookNumber, filters.chapterNumber]);

  useEffect(() => {
    loadWords(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    filters.bookNumber,
    filters.chapterNumber,
    filters.entryType,
    filters.kanjiMode,
    filters.studyListId,
  ]);

  const typeLabel =
    filters.entryType === "vocab"
      ? "Vocab"
      : filters.entryType === "extra"
        ? selectedStudyList?.name || "Extra"
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

          <div className="mt-4 flex shrink-0 items-center gap-3">
            <Button
              variant="secondary"
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-2 px-5 py-3 text-xs sm:text-sm"
            >
              <SearchIcon className="h-4 w-4" />
              Search
            </Button>

            <Button
              variant="secondary"
              onClick={signOut}
              className="shrink-0 px-5 py-3 text-xs sm:text-sm"
            >
              Sign out
            </Button>
          </div>
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
            studyLists={studyLists}
            listsLoading={listsLoading}
            onCreateStudyList={handleCreateStudyList}
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
              wordType={filters.entryType === "kanji" ? "kanji" : "vocab"}
              onEdit={(word) => {
                setEditing(word);
              }}
              onChanged={() => loadWords(filters)}
            />
          )}
        </div>
      </div>

      <AdminGlobalSearchModal
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        onOpenResult={handleOpenSearchResult}
      />
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