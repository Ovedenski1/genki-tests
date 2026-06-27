"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/ui/Card";
import { deleteWord } from "@/lib/queries";
import type { GenkiWord, WordType } from "@/types/genki";

function EditIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
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
    <svg viewBox="0 0 24 24" fill="none" className={className}>
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
      <div className="flex justify-center gap-1.5">
        <button
          type="button"
          onClick={() => onEdit(word)}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-blue-100 bg-white text-[#173763] shadow-sm shadow-slate-200/70 transition hover:-translate-y-0.5 hover:bg-blue-50"
        >
          <EditIcon className="h-3.5 w-3.5" />
        </button>

        <button
          type="button"
          onClick={() => remove(word)}
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-500 text-white shadow-md shadow-rose-200/70 transition hover:-translate-y-0.5 hover:bg-rose-600"
        >
          <TrashIcon className="h-3.5 w-3.5" />
        </button>
      </div>
    );
  }

  function renderVocabColGroup() {
    return (
      <colgroup>
        <col style={{ width: "22%" }} />
        <col style={{ width: "20%" }} />
        <col style={{ width: "8%" }} />
        <col style={{ width: "22%" }} />
        <col style={{ width: "20%" }} />
        <col style={{ width: "8%" }} />
      </colgroup>
    );
  }

  function renderKanjiColGroup() {
    return (
      <colgroup>
        <col style={{ width: "22%" }} />
        <col style={{ width: "22%" }} />
        <col style={{ width: "16%" }} />
        <col style={{ width: "26%" }} />
        <col style={{ width: "14%" }} />
      </colgroup>
    );
  }

  function renderVocabHalf(word?: GenkiWord) {
    if (!word) {
      return (
        <>
          <td className="border-b border-slate-100 bg-white px-2.5 py-2.5" />
          <td className="border-b border-slate-100 bg-white px-2.5 py-2.5" />
          <td className="border-b border-slate-100 bg-white px-2 py-2.5" />
        </>
      );
    }

    return (
      <>
        <td className="break-words border-b border-slate-100 bg-white px-2.5 py-2.5 text-xs font-black text-[#173763]">
          {wordLabel(word)}
        </td>

        <td className="break-words border-b border-slate-100 bg-white px-2.5 py-2.5 text-sm font-black text-[#173763]">
          {word.japanese}
        </td>

        <td className="border-b border-slate-100 bg-white px-2 py-2.5">
          {renderActionButtons(word)}
        </td>
      </>
    );
  }

  function renderVocabDoubleTable() {
    return (
      <div className="min-h-0 flex flex-1 flex-col bg-white">
        <div className="shrink-0 overflow-hidden bg-[#173763]">
          <table className="w-full table-fixed text-left text-xs">
            {renderVocabColGroup()}

            <thead>
              <tr className="bg-[#173763] text-white">
                <th className="px-2.5 py-3">Question</th>
                <th className="px-2.5 py-3">Answer</th>
                <th className="px-2 py-3 text-center">Actions</th>

                <th className="border-l border-white/25 px-2.5 py-3">
                  Question
                </th>
                <th className="px-2.5 py-3">Answer</th>
                <th className="px-2 py-3 text-center">Actions</th>
              </tr>
            </thead>
          </table>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden bg-white">
          <table className="w-full table-fixed text-left text-xs">
            {renderVocabColGroup()}

            <tbody>
              {leftWords.map((leftWord, index) => (
                <tr key={leftWord.id}>
                  {renderVocabHalf(leftWord)}
                  {renderVocabHalf(rightWords[index])}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  function renderKanjiTable() {
    return (
      <div className="min-h-0 flex flex-1 flex-col bg-white">
        <div className="shrink-0 overflow-hidden bg-[#173763]">
          <table className="w-full table-fixed text-left text-xs">
            {renderKanjiColGroup()}

            <thead>
              <tr className="bg-[#173763] text-white">
                <th className="px-2.5 py-3">Question</th>
                <th className="px-2.5 py-3">Answer</th>
                <th className="px-2 py-3">Mode</th>
                <th className="px-2.5 py-3">Reading</th>
                <th className="px-2 py-3 text-center">Actions</th>
              </tr>
            </thead>
          </table>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden bg-white">
          <table className="w-full table-fixed text-left text-xs">
            {renderKanjiColGroup()}

            <tbody>
              {filteredWords.map((word) => (
                <tr key={word.id} className="border-b border-slate-100 bg-white">
                  <td className="break-words px-2.5 py-3 text-xs font-black text-[#173763]">
                    {wordLabel(word)}
                  </td>

                  <td className="break-words px-2.5 py-3 text-sm font-black text-[#173763]">
                    {word.japanese}
                  </td>

                  <td className="px-2 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[9px] font-black uppercase ${
                        word.kanji_mode === "back"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {word.kanji_mode === "back" ? "Back" : "Vocab"}
                    </span>
                  </td>

                  <td className="break-words px-2.5 py-3 text-xs font-bold text-slate-500">
                    {word.reading || "—"}
                  </td>

                  <td className="px-2 py-3">{renderActionButtons(word)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <Card className="flex h-[535px] w-full flex-col overflow-hidden">
      <div className="shrink-0 border-b border-slate-100 bg-white/95 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-black text-[#173763]">
              {filteredWords.length}{" "}
              {filteredWords.length === 1 ? "word" : "words"}
            </p>

            <p className="mt-0.5 text-[11px] font-semibold text-slate-500">
              {search.trim()
                ? `Showing ${filteredWords.length} of ${words.length}`
                : `Total in this selection: ${words.length}`}
            </p>
          </div>

          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search words..."
            className="h-11 w-56 rounded-xl border border-blue-200 bg-white/90 px-4 text-xs font-semibold text-[#173763] outline-none transition placeholder:text-slate-400 focus:border-[#6d94d2] focus:ring-4 focus:ring-blue-200/70"
          />
        </div>
      </div>

      {filteredWords.length === 0 ? (
        <div className="flex flex-1 items-center justify-center bg-white px-4 py-8 text-center text-sm font-black text-slate-500">
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