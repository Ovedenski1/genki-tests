"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/ui/Card";
import { deleteWord } from "@/lib/queries";
import type { GenkiWord, WordType } from "@/types/genki";

function EditIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M4 20h4.2L19.1 9.1a2.1 2.1 0 0 0 0-3L17.9 4.9a2.1 2.1 0 0 0-3 0L4 15.8V20Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M13.5 6.5l4 4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function TrashIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M4 7h16"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M6.5 7l1 13h9l1-13"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M10 11v5M14 11v5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function AdminWordsTable({
  words,
  wordType,
  onEdit,
  onChanged,
}: {
  words: GenkiWord[];
  wordType: WordType;
  onEdit: (word: GenkiWord) => void;
  onChanged: () => void;
}) {
  const [search, setSearch] = useState("");
  const showKanjiFields = wordType === "kanji";

  const filteredWords = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) return words;

    return words.filter((word) => {
      const searchable = [
        word.english,
        word.japanese,
        word.kanji,
        word.reading,
        word.hiragana,
        word.katakana,
        word.notes,
        word.word_type,
        wordType === "kanji" ? word.kanji_mode : "",
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchable.includes(value);
    });
  }, [search, words, wordType]);

  const splitIndex = Math.ceil(filteredWords.length / 2);
  const leftWords = filteredWords.slice(0, splitIndex);
  const rightWords = filteredWords.slice(splitIndex);

  async function remove(word: GenkiWord) {
    const label =
      wordType === "kanji" ? word.kanji || word.english : word.english;

    const ok = window.confirm(`Delete "${label}"?`);
    if (!ok) return;

    await deleteWord(word.id);
    onChanged();
  }

  function wordLabel(word: GenkiWord) {
    return wordType === "kanji" ? word.kanji : word.english;
  }

  function renderActionButtons(word: GenkiWord) {
    return (
      <div className="flex justify-center gap-2">
        <button
          type="button"
          title="Edit"
          aria-label="Edit word"
          onClick={() => onEdit(word)}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-blue-100 bg-white text-[#173763] shadow-sm shadow-slate-200/70 transition hover:-translate-y-0.5 hover:bg-blue-50 hover:shadow-md"
        >
          <EditIcon className="h-4 w-4" />
        </button>

        <button
          type="button"
          title="Delete"
          aria-label="Delete word"
          onClick={() => remove(word)}
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-500 text-white shadow-md shadow-rose-200/70 transition hover:-translate-y-0.5 hover:bg-rose-600 hover:shadow-lg"
        >
          <TrashIcon className="h-4 w-4" />
        </button>
      </div>
    );
  }

  function renderVocabHalf(word?: GenkiWord) {
    if (!word) {
      return (
        <>
          <td className="border-b border-slate-100 bg-white px-4 py-4" />
          <td className="border-b border-slate-100 bg-white px-4 py-4" />
          <td className="border-b border-slate-100 bg-white px-3 py-4" />
        </>
      );
    }

    return (
      <>
        <td className="break-words border-b border-slate-100 bg-white px-4 py-4 align-middle text-base font-black text-[#173763] 2xl:text-lg">
          {wordLabel(word)}
        </td>

        <td className="break-words border-b border-slate-100 bg-white px-4 py-4 align-middle text-lg font-black text-[#173763] 2xl:text-xl">
          {word.japanese}
        </td>

        <td className="border-b border-slate-100 bg-white px-3 py-4 align-middle">
          {renderActionButtons(word)}
        </td>
      </>
    );
  }

  function renderVocabDoubleTable() {
    return (
      <div className="max-h-[620px] max-w-full overflow-y-auto overflow-x-hidden">
        <table className="w-full table-fixed text-left text-sm 2xl:text-base">
          <thead className="sticky top-0 z-20">
            <tr className="bg-[#173763] text-white shadow-sm">
              <th className="w-[25%] px-4 py-4">Question</th>
              <th className="w-[18%] px-4 py-4">Answer</th>
              <th className="w-[11%] px-3 py-4 text-center">Actions</th>

              <th className="w-[25%] border-l border-white/25 px-4 py-4">
                Question
              </th>
              <th className="w-[18%] px-4 py-4">Answer</th>
              <th className="w-[11%] px-3 py-4 text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {leftWords.map((leftWord, index) => {
              const rightWord = rightWords[index];

              return (
                <tr
                  key={leftWord.id}
                  className="transition hover:bg-blue-50/40"
                >
                  {renderVocabHalf(leftWord)}
                  {renderVocabHalf(rightWord)}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }

  function renderKanjiTable() {
    return (
      <div className="max-h-[620px] max-w-full overflow-y-auto overflow-x-hidden">
        <table className="w-full table-fixed text-left text-sm 2xl:text-base">
          <thead className="sticky top-0 z-20">
            <tr className="bg-[#173763] text-white shadow-sm">
              <th className="w-[24%] px-4 py-4">Question</th>
              <th className="w-[24%] px-4 py-4">Answer</th>
              <th className="w-[16%] px-3 py-4">Mode</th>
              <th className="w-[22%] px-4 py-4">Reading</th>
              <th className="w-[14%] px-3 py-4 text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredWords.map((word) => (
              <tr
                key={word.id}
                className="border-b border-slate-100 bg-white transition hover:bg-blue-50/40"
              >
                <td className="break-words px-4 py-4 text-base font-black text-[#173763] 2xl:text-lg">
                  {wordLabel(word)}
                </td>

                <td className="break-words px-4 py-4 text-lg font-black text-[#173763] 2xl:text-xl">
                  {word.japanese}
                </td>

                <td className="px-3 py-4">
                  <span
                    className={`rounded-full px-2 py-1 text-[10px] font-black uppercase ${
                      word.kanji_mode === "back"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {word.kanji_mode === "back" ? "Back" : "Vocab"}
                  </span>
                </td>

                <td className="break-words px-4 py-4 font-bold text-slate-500">
                  {word.reading || "—"}
                </td>

                <td className="px-3 py-4">{renderActionButtons(word)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <Card className="w-full max-w-full overflow-hidden xl:w-[980px] 2xl:w-[1120px]">
      <div className="border-b border-slate-100 bg-white/95 p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-lg font-black text-[#173763] sm:text-xl">
              {filteredWords.length}{" "}
              {filteredWords.length === 1 ? "word" : "words"}
            </p>

            <p className="mt-1 text-sm font-semibold text-slate-500">
              {search.trim()
                ? `Showing ${filteredWords.length} of ${words.length}`
                : `Total in this selection: ${words.length}`}
            </p>
          </div>

          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search words..."
            className="w-full rounded-xl border border-blue-200 bg-white/90 px-4 py-3 text-base font-semibold text-[#173763] outline-none transition placeholder:text-slate-400 focus:border-[#6d94d2] focus:ring-4 focus:ring-blue-200/70 sm:w-72"
          />
        </div>
      </div>

      {filteredWords.length === 0 ? (
        <div className="bg-white px-4 py-12 text-center text-lg font-black text-slate-500">
          {words.length === 0
            ? "No words for this selection."
            : "No words match your search."}
        </div>
      ) : showKanjiFields ? (
        renderKanjiTable()
      ) : (
        renderVocabDoubleTable()
      )}
    </Card>
  );
}