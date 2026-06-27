"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { searchAdminWords } from "@/lib/queries";
import type { AdminWordSearchResult, GenkiWord } from "@/types/genki";

export function SearchIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M10.8 18.1a7.3 7.3 0 1 1 0-14.6 7.3 7.3 0 0 1 0 14.6Z"
        stroke="currentColor"
        strokeWidth="2.2"
      />
      <path
        d="M16.2 16.2 21 21"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CloseIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M6 6l12 12M18 6 6 18"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function locationText(result: AdminWordSearchResult) {
  const word = result.word;

  if (word.word_type === "kanji") {
    const mode = word.kanji_mode === "back" ? "Kanji Back" : "Kanji Vocab";

    return `Genki ${word.book_number} · Chapter ${word.chapter_number} · ${mode}`;
  }

  if (word.study_list_id) {
    return `Genki ${word.book_number} · Chapter ${
      word.chapter_number
    } · Extra · ${result.studyList?.name || "Unknown list"}`;
  }

  return `Genki ${word.book_number} · Chapter ${word.chapter_number} · Main Vocab`;
}

function mainLabel(word: GenkiWord) {
  if (word.word_type === "kanji") {
    return word.kanji || word.english || "Untitled";
  }

  return word.english || "Untitled";
}

function secondLabel(word: GenkiWord) {
  const parts = [word.japanese, word.reading].filter(Boolean);

  return parts.length > 0 ? parts.join(" · ") : "—";
}

export function AdminGlobalSearchModal({
  open,
  onClose,
  onOpenResult,
}: {
  open: boolean;
  onClose: () => void;
  onOpenResult: (result: AdminWordSearchResult) => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<AdminWordSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const inputRef = useRef<HTMLInputElement | null>(null);

  const cleanQuery = useMemo(() => query.trim(), [query]);

  useEffect(() => {
    if (!open) return;

    window.setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  }, [open]);

  useEffect(() => {
    if (!open) return;

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", closeOnEscape);

    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;

    if (!cleanQuery) {
      setResults([]);
      setLoading(false);
      setError("");
      return;
    }

    let cancelled = false;

    const timer = window.setTimeout(async () => {
      setLoading(true);
      setError("");

      try {
        const data = await searchAdminWords(cleanQuery);

        if (!cancelled) {
          setResults(data);
        }
      } catch (caughtError) {
        if (!cancelled) {
          setError(
            caughtError instanceof Error
              ? caughtError.message
              : "Could not search words."
          );
          setResults([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }, 250);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [cleanQuery, open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-[#173763]/35 px-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="soft-pop w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 p-5">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.32em] text-[#6d94d2]">
              Admin search
            </p>

            <h2 className="mt-1.5 text-3xl font-black text-[#173763]">
              Find any word
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-[#173763] transition hover:bg-slate-200"
            aria-label="Close search"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="p-5">
          <div className="relative">
            <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#6d94d2]" />

            <input
              ref={inputRef}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search English, Japanese, kanji, reading..."
              className="h-12 w-full rounded-xl border border-blue-200 bg-white/90 pl-12 pr-4 text-sm font-bold text-[#173763] outline-none transition placeholder:text-slate-400 focus:border-[#6d94d2] focus:ring-4 focus:ring-blue-200/70"
            />
          </div>

          <div className="mt-4 max-h-[55svh] overflow-y-auto pr-1">
            {!cleanQuery ? (
              <div className="rounded-xl bg-slate-50 px-4 py-8 text-center text-sm font-black text-slate-500">
                Type a word to search everywhere.
              </div>
            ) : loading ? (
              <div className="rounded-xl bg-slate-50 px-4 py-8 text-center text-sm font-black text-slate-500">
                Searching...
              </div>
            ) : error ? (
              <div className="rounded-xl bg-rose-50 px-4 py-4 text-sm font-black text-rose-700">
                {error}
              </div>
            ) : results.length === 0 ? (
              <div className="rounded-xl bg-slate-50 px-4 py-8 text-center text-sm font-black text-slate-500">
                No matches.
              </div>
            ) : (
              <div className="grid gap-3">
                {results.map((result) => (
                  <div
                    key={result.word.id}
                    className="rounded-xl border border-slate-100 bg-white p-4 shadow-md shadow-slate-200/60"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0">
                        <p className="break-words text-lg font-black text-[#173763]">
                          {mainLabel(result.word)}
                        </p>

                        <p className="mt-0.5 break-words text-sm font-bold text-slate-500">
                          {secondLabel(result.word)}
                        </p>

                        <p className="mt-2 break-words text-xs font-black uppercase tracking-[0.14em] text-[#6d94d2]">
                          {locationText(result)}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => onOpenResult(result)}
                        className="shrink-0 rounded-xl bg-gradient-to-br from-[#92b2e8] to-[#6d94d2] px-4 py-2.5 text-sm font-black text-white shadow-lg shadow-blue-200/70 transition hover:-translate-y-0.5 hover:brightness-105"
                      >
                        Open
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}