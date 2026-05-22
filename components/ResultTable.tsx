import type { TypingResult } from "@/types/genki";

export function ResultTable({ results }: { results: TypingResult[] }) {
  const showReading = results.some((result) => result.reading);

  // Vocab results can fit 3 groups per row.
  // Kanji/reading results need more columns, so keep 2 groups per row.
  const groupsPerRow = showReading ? 2 : 3;

  const rows: TypingResult[][] = [];

  for (let index = 0; index < results.length; index += groupsPerRow) {
    rows.push(results.slice(index, index + groupsPerRow));
  }

  const groupColSpan = showReading ? 5 : 4;

  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-xl shadow-slate-200/70">
      <table className="w-full table-fixed text-left text-[11px] sm:text-xs">
        <thead>
          <tr className="bg-[#173763] text-white">
            {Array.from({ length: groupsPerRow }, (_, groupIndex) => (
              <HeaderCells
                key={groupIndex}
                showReading={showReading}
                withDivider={groupIndex > 0}
              />
            ))}
          </tr>
        </thead>

        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {Array.from({ length: groupsPerRow }, (_, groupIndex) => {
                const result = row[groupIndex];
                const number = rowIndex * groupsPerRow + groupIndex + 1;

                if (!result) {
                  return (
                    <td
                      key={groupIndex}
                      colSpan={groupColSpan}
                      className={`bg-white px-2 py-2 ${
                        groupIndex > 0 ? "border-l border-slate-200" : ""
                      }`}
                    />
                  );
                }

                return (
                  <ResultCells
                    key={groupIndex}
                    result={result}
                    number={number}
                    showReading={showReading}
                    withDivider={groupIndex > 0}
                  />
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function HeaderCells({
  showReading,
  withDivider = false,
}: {
  showReading: boolean;
  withDivider?: boolean;
}) {
  const divider = withDivider ? "border-l border-white/20" : "";

  return (
    <>
      <th className={`${divider} w-[32px] px-2 py-2`}>#</th>
      <th className="px-2 py-2">Question</th>
      <th className="px-2 py-2">Answer</th>
      <th className="px-2 py-2">You</th>

      {showReading ? <th className="px-2 py-2">Reading</th> : null}
    </>
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
      <td
        className={`${bg} ${divider} w-[32px] px-2 py-2 align-top font-black text-[#173763]`}
      >
        {number}
      </td>

      <td
        className={`${bg} break-words px-2 py-2 align-top font-black leading-snug text-[#173763]`}
      >
        {result.prompt}
      </td>

      <td
        className={`${bg} break-words px-2 py-2 align-top font-black leading-snug text-[#173763]`}
      >
        {result.expected}
      </td>

      <td
        className={`${bg} break-words px-2 py-2 align-top font-black leading-snug text-[#173763]`}
      >
        {result.userAnswer || "—"}
      </td>

      {showReading ? (
        <td
          className={`${bg} break-words px-2 py-2 align-top text-[11px] font-bold leading-snug text-slate-500`}
        >
          {result.reading || "—"}
        </td>
      ) : null}
    </>
  );
}