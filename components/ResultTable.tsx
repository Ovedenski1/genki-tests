"use client";

import { useMemo, useState } from "react";
import type { TypingResult } from "@/types/genki";

type FilterType = "all" | "mistakes" | "correct";

export function ResultTable({ results }: { results: TypingResult[] }) {
  const [filter, setFilter] = useState<FilterType>("all");

  const showReading = results.some((result) => result.reading);

  const filteredResults = useMemo(() => {
    if (filter === "mistakes") {
      return results.filter((result) => !result.correct);
    }

    if (filter === "correct") {
      return results.filter((result) => result.correct);
    }

    return results;
  }, [filter, results]);

  const correctCount = results.filter((result) => result.correct).length;
  const mistakeCount = results.length - correctCount;

  return (
    <div className="grid gap-3">
      <div className="flex flex-wrap items-center justify-center gap-2">
        <FilterButton
          active={filter === "all"}
          onClick={() => setFilter("all")}
        >
          All {results.length}
        </FilterButton>

        <FilterButton
          active={filter === "mistakes"}
          onClick={() => setFilter("mistakes")}
        >
          Mistakes {mistakeCount}
        </FilterButton>

        <FilterButton
          active={filter === "correct"}
          onClick={() => setFilter("correct")}
        >
          Correct {correctCount}
        </FilterButton>
      </div>

      {filteredResults.length === 0 ? (
        <div className="rounded-xl bg-white px-4 py-6 text-center text-sm font-black text-slate-500 shadow-md shadow-slate-200/60">
          Nothing to show here.
        </div>
      ) : (
        <div
          className={`grid gap-2 ${
            showReading ? "sm:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-3"
          }`}
        >
          {filteredResults.map((result, index) => (
            <CompactResultRow
              key={`${result.prompt}-${index}`}
              result={result}
              number={results.indexOf(result) + 1}
              showReading={showReading}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function FilterButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-4 py-2 text-xs font-black transition sm:text-sm ${
        active
          ? "bg-[#173763] text-white shadow-md shadow-blue-200/70"
          : "bg-white text-[#173763] shadow-sm shadow-slate-200/70 hover:bg-blue-50"
      }`}
    >
      {children}
    </button>
  );
}

function CompactResultRow({
  result,
  number,
  showReading,
}: {
  result: TypingResult;
  number: number;
  showReading: boolean;
}) {
  const bg = result.correct ? "bg-green-50" : "bg-rose-50";
  const border = result.correct ? "border-green-100" : "border-rose-100";
  const mark = result.correct ? "○" : "×";
  const markColor = result.correct ? "text-green-700" : "text-rose-700";

  return (
    <div
      className={`${bg} ${border} rounded-xl border px-3 py-2 shadow-sm shadow-slate-200/60`}
    >
      <div className="flex items-start gap-2">
        <div className="shrink-0 text-sm font-black text-[#173763]">
          {number}.
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="break-words text-sm font-black leading-snug text-[#173763] sm:text-base">
              {result.prompt}
            </p>

            <span className={`shrink-0 text-xl font-black leading-none ${markColor}`}>
              {mark}
            </span>
          </div>

          <div className="mt-1 grid grid-cols-2 gap-2 text-xs font-black leading-snug text-[#173763] sm:text-sm">
            <p className="break-words">
              <span className="text-slate-400">A: </span>
              {result.expected}
            </p>

            <p className="break-words">
              <span className="text-slate-400">You: </span>
              {result.userAnswer || "—"}
            </p>
          </div>

          {showReading ? (
            <p className="mt-1 break-words text-[11px] font-bold leading-snug text-slate-500 sm:text-xs">
              {result.reading || "—"}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}