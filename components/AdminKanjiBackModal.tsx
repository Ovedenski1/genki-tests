"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { fetchAllKanjiBackWords } from "@/lib/queries";
import type { GenkiWord } from "@/types/genki";

export function KanjiBackIcon({ className = "" }: { className?: string }) {
  return (
    <span className={className} aria-hidden="true">
      字
    </span>
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

function SearchIconSmall({ className = "" }: { className?: string }) {
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

type KanjiEntry = {
  kanji: string;
  words: GenkiWord[];
};

function extractSingleKanji(value: string | null | undefined) {
  if (!value) return [];

  const matches = value.match(/\p{Script=Han}/gu) || [];

  return Array.from(new Set(matches));
}

function normalize(value: string | null | undefined) {
  return (value || "")
    .normalize("NFKC")
    .toLowerCase()
    .replace(/\s+/g, "")
    .trim();
}

function displayChapter(bookNumber: number, chapterNumber: number) {
  if (bookNumber === 2 && chapterNumber >= 1) {
    return chapterNumber + 12;
  }

  return chapterNumber;
}

function wordMainText(word: GenkiWord) {
  return word.kanji || word.english || "Untitled";
}

function wordSubText(word: GenkiWord) {
  const parts = [word.japanese, word.reading, word.english].filter(Boolean);
  return parts.length > 0 ? parts.join(" · ") : "—";
}

function wordSearchText(word: GenkiWord) {
  return normalize(
    [
      word.english,
      word.japanese,
      word.hiragana,
      word.katakana,
      word.kanji,
      word.reading,
      word.notes,
    ]
      .filter(Boolean)
      .join(" ")
  );
}

function isSingleKanjiInfoWord(word: GenkiWord, kanji: string) {
  const main = wordMainText(word).trim();

  return main === kanji;
}

function kanjiReading(word: GenkiWord | null) {
  if (!word) return "—";

  return word.japanese || word.hiragana || "—";
}

function kanjiMeaning(word: GenkiWord | null, kanji: string) {
  if (!word) return "—";

  const options = [word.reading, word.notes, word.english].filter(Boolean);

  const meaning = options.find((item) => normalize(item) !== normalize(kanji));

  return meaning || "—";
}

function buildKanjiEntries(words: GenkiWord[]) {
  const map = new Map<string, GenkiWord[]>();

  words.forEach((word) => {
    const kanjiList = extractSingleKanji(word.kanji || word.english || "");

    kanjiList.forEach((kanji) => {
      const oldWords = map.get(kanji) || [];

      if (!oldWords.some((oldWord) => oldWord.id === word.id)) {
        map.set(kanji, [...oldWords, word]);
      }
    });
  });

  return Array.from(map.entries())
    .map(([kanji, kanjiWords]) => ({
      kanji,
      words: kanjiWords,
    }))
    .sort((a, b) => a.kanji.localeCompare(b.kanji, "ja"));
}

function KanjiPracticeSquare({ kanji }: { kanji: string }) {
  return (
    <div className="relative h-[280px] w-[280px] shrink-0 overflow-hidden rounded-2xl border border-blue-200 bg-white shadow-xl shadow-blue-100/80 sm:h-[320px] sm:w-[320px]">
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-50/70 to-white" />

      <div className="absolute left-1/2 top-0 h-full border-l-2 border-dashed border-[#6d94d2]/20" />
      <div className="absolute left-0 top-1/2 w-full border-t-2 border-dashed border-[#6d94d2]/20" />

      <div className="absolute left-[-15%] top-1/2 w-[130%] rotate-45 border-t-2 border-dashed border-[#6d94d2]/14" />
      <div className="absolute left-[-15%] top-1/2 w-[130%] -rotate-45 border-t-2 border-dashed border-[#6d94d2]/14" />

      <div className="absolute inset-4 rounded-xl border-2 border-dashed border-[#6d94d2]/16" />

      <div className="relative z-10 flex h-full items-center justify-center">
        <span className="select-none text-[120px] font-black leading-none text-[#173763] sm:text-[255px]">
          {kanji}
        </span>
      </div>
    </div>
  );
}

function KanjiInfoBox({
  kanji,
  infoWord,
}: {
  kanji: string;
  infoWord: GenkiWord | null;
}) {
  return (
    <div className="mt-4 w-[280px] rounded-2xl border border-blue-100 bg-white p-4 shadow-md shadow-blue-100/70 sm:w-[320px]">
      <div className="grid gap-3">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#6d94d2]">
            Reading
          </p>

          <p className="mt-1 break-words text-lg font-black text-[#173763]">
            {kanjiReading(infoWord)}
          </p>
        </div>

        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#6d94d2]">
            Meaning
          </p>

          <p className="mt-1 break-words text-base font-bold text-slate-600">
            {kanjiMeaning(infoWord, kanji)}
          </p>
        </div>

        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#6d94d2]">
            Learned in
          </p>

          <p className="mt-1 break-words text-sm font-black text-[#173763]">
            {infoWord
              ? `Genki ${infoWord.book_number} · Chapter ${displayChapter(
                  infoWord.book_number,
                  infoWord.chapter_number
                )}`
              : "—"}
          </p>
        </div>
      </div>
    </div>
  );
}

export function AdminKanjiBackModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [words, setWords] = useState<GenkiWord[]>([]);
  const [selectedKanji, setSelectedKanji] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const inputRef = useRef<HTMLInputElement | null>(null);

  const kanjiEntries = useMemo(() => buildKanjiEntries(words), [words]);

  const selectedEntry = useMemo(() => {
    if (!selectedKanji) return null;

    return kanjiEntries.find((entry) => entry.kanji === selectedKanji) || null;
  }, [kanjiEntries, selectedKanji]);

  const selectedInfo = useMemo(() => {
    if (!selectedEntry) {
      return {
        infoWord: null as GenkiWord | null,
        relatedWords: [] as GenkiWord[],
      };
    }

    const infoWord =
      selectedEntry.words.find((word) =>
        isSingleKanjiInfoWord(word, selectedEntry.kanji)
      ) || null;

    const relatedWords = infoWord
      ? selectedEntry.words.filter((word) => word.id !== infoWord.id)
      : selectedEntry.words;

    return {
      infoWord,
      relatedWords,
    };
  }, [selectedEntry]);

  const filteredEntries = useMemo(() => {
    const clean = normalize(query);

    if (!clean) return kanjiEntries;

    return kanjiEntries.filter((entry) => {
      if (normalize(entry.kanji).includes(clean)) return true;

      return entry.words.some((word) => wordSearchText(word).includes(clean));
    });
  }, [kanjiEntries, query]);

  useEffect(() => {
    if (!open) return;

    let cancelled = false;

    async function loadKanjiBack() {
      setLoading(true);
      setError("");

      try {
        const data = await fetchAllKanjiBackWords();

        if (!cancelled) {
          setWords(data);
        }
      } catch (caughtError) {
        if (!cancelled) {
          setError(
            caughtError instanceof Error
              ? caughtError.message
              : "Could not load kanji."
          );
          setWords([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadKanjiBack();

    window.setTimeout(() => {
      inputRef.current?.focus();
    }, 0);

    return () => {
      cancelled = true;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        if (selectedKanji) {
          setSelectedKanji(null);
        } else {
          onClose();
        }
      }
    }

    window.addEventListener("keydown", closeOnEscape);

    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [open, onClose, selectedKanji]);

  useEffect(() => {
    if (!open) {
      setSelectedKanji(null);
      setQuery("");
      setError("");
    }
  }, [open]);

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
      <div className="soft-pop flex max-h-[86svh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 p-5">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.32em] text-[#6d94d2]">
              Kanji Back
            </p>

            <h2 className="mt-1.5 text-3xl font-black text-[#173763]">
              {selectedEntry ? selectedEntry.kanji : "Kanji index"}
            </h2>

            <p className="mt-1 text-sm font-bold text-slate-500">
              {selectedEntry
                ? `${selectedInfo.relatedWords.length} word${
                    selectedInfo.relatedWords.length === 1 ? "" : "s"
                  } with this kanji`
                : `${filteredEntries.length} kanji from ${words.length} kanji back rows`}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-[#173763] transition hover:bg-slate-200"
            aria-label="Close kanji modal"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        {!selectedEntry ? (
          <div className="border-b border-slate-100 p-5">
            <div className="relative">
              <SearchIconSmall className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#6d94d2]" />

              <input
                ref={inputRef}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search kanji, English, Japanese, reading..."
                className="h-12 w-full rounded-xl border border-blue-200 bg-white/90 pl-12 pr-4 text-sm font-bold text-[#173763] outline-none transition placeholder:text-slate-400 focus:border-[#6d94d2] focus:ring-4 focus:ring-blue-200/70"
              />
            </div>
          </div>
        ) : null}

        <div className="min-h-0 flex-1 overflow-y-auto p-5">
          {loading ? (
            <div className="rounded-xl bg-slate-50 px-4 py-10 text-center text-sm font-black text-slate-500">
              Loading kanji...
            </div>
          ) : error ? (
            <div className="rounded-xl bg-rose-50 px-4 py-4 text-sm font-black text-rose-700">
              {error}
            </div>
          ) : selectedEntry ? (
            <div>
              <button
                type="button"
                onClick={() => {
                  setSelectedKanji(null);
                  setQuery("");
                  window.setTimeout(() => inputRef.current?.focus(), 0);
                }}
                className="mb-5 text-sm font-black text-slate-500 transition hover:text-[#173763]"
              >
                ← Back to kanji index
              </button>

              <div className="grid gap-6 lg:grid-cols-[340px_minmax(0,1fr)]">
                <div className="flex flex-col items-center lg:items-start">
                  <KanjiPracticeSquare kanji={selectedEntry.kanji} />

                  <KanjiInfoBox
                    kanji={selectedEntry.kanji}
                    infoWord={selectedInfo.infoWord}
                  />
                </div>

                <div className="grid content-start gap-3">
                  {selectedInfo.relatedWords.length === 0 ? (
                    <div className="rounded-2xl bg-slate-50 px-4 py-8 text-center text-sm font-black text-slate-500">
                      No extra words with this kanji yet.
                    </div>
                  ) : (
                    selectedInfo.relatedWords.map((word) => (
                      <div
                        key={word.id}
                        className="rounded-2xl border border-slate-100 bg-white p-5 shadow-md shadow-slate-200/60"
                      >
                        <p className="break-words text-4xl font-black leading-tight text-[#173763] sm:text-5xl">
                          {wordMainText(word)}
                        </p>

                        <p className="mt-3 break-words text-base font-bold text-slate-500">
                          {wordSubText(word)}
                        </p>

                        <p className="mt-3 break-words text-xs font-black uppercase tracking-[0.14em] text-[#6d94d2]">
                          Genki {word.book_number} · Chapter{" "}
                          {displayChapter(
                            word.book_number,
                            word.chapter_number
                          )}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          ) : filteredEntries.length === 0 ? (
            <div className="rounded-xl bg-slate-50 px-4 py-8 text-center text-sm font-black text-slate-500">
              No kanji found.
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-5 md:grid-cols-7 lg:grid-cols-9">
              {filteredEntries.map((entry) => (
                <button
                  key={entry.kanji}
                  type="button"
                  onClick={() => {
                    setSelectedKanji(entry.kanji);
                    setQuery("");
                  }}
                  className="group flex aspect-square flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-[#92b2e8] to-[#6d94d2] text-white shadow-lg shadow-blue-200/70 transition hover:-translate-y-1 hover:brightness-105"
                >
                  <span className="text-5xl font-black leading-none">
                    {entry.kanji}
                  </span>

                  <span className="mt-2 rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-black">
                    {entry.words.length}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}