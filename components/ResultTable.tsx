import type { TypingResult } from "@/types/genki";

export function ResultTable({ results }: { results: TypingResult[] }) {
  const showReading = results.some((result) => result.reading);

  const rows: Array<[TypingResult, TypingResult | null]> = [];

  for (let index = 0; index < results.length; index += 2) {
    rows.push([results[index], results[index + 1] || null]);
  }

  const groupColSpan = showReading ? 5 : 4;

  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-xl shadow-slate-200/70">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-left text-base">
          <thead>
            <tr className="bg-[#173763] text-white">
              <th className="px-4 py-4">#</th>
              <th className="px-4 py-4">Question</th>
              <th className="px-4 py-4">Answer</th>
              <th className="px-4 py-4">You</th>

              {showReading ? (
                <th className="px-4 py-4">Reading</th>
              ) : null}

              <th className="border-l border-white/20 px-4 py-4">#</th>
              <th className="px-4 py-4">Question</th>
              <th className="px-4 py-4">Answer</th>
              <th className="px-4 py-4">You</th>

              {showReading ? (
                <th className="px-4 py-4">Reading</th>
              ) : null}
            </tr>
          </thead>

          <tbody>
            {rows.map(([left, right], rowIndex) => (
              <tr key={rowIndex}>
                <ResultCells
                  result={left}
                  number={rowIndex * 2 + 1}
                  showReading={showReading}
                />

                {right ? (
                  <ResultCells
                    result={right}
                    number={rowIndex * 2 + 2}
                    showReading={showReading}
                    withDivider
                  />
                ) : (
                  <td
                    colSpan={groupColSpan}
                    className="border-l border-slate-200 bg-white px-4 py-5"
                  />
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ResultCells({
  result,
  number,
  showReading,
  withDivider = false,
}: {
  result: TypingResult;
  number: number;
  showReading: boolean;
  withDivider?: boolean;
}) {
  const bg = result.correct ? "bg-green-50" : "bg-rose-50";
  const divider = withDivider ? "border-l border-slate-200" : "";

  return (
    <>
      <td className={`${bg} ${divider} px-4 py-5 font-black text-[#173763]`}>
        {number}
      </td>

      <td className={`${bg} px-4 py-5 text-xl font-black text-[#173763]`}>
        {result.prompt}
      </td>

      <td className={`${bg} px-4 py-5 text-xl font-black text-[#173763]`}>
        {result.expected}
      </td>

      <td className={`${bg} px-4 py-5 text-xl font-black text-[#173763]`}>
        {result.userAnswer || "—"}
      </td>

      {showReading ? (
        <td className={`${bg} px-4 py-5 font-bold text-slate-500`}>
          {result.reading || "—"}
        </td>
      ) : null}
    </>
  );
}