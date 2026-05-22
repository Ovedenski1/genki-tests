"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { OpenBookIcon } from "@/components/StudyIcons";

export function ChapterGrid({ book }: { book: number }) {
  const [pageReady, setPageReady] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setPageReady(true);
    });

    return () => cancelAnimationFrame(frame);
  }, []);

  const cardAnimation = pageReady
    ? "translate-y-0 scale-100 opacity-100"
    : "translate-y-8 scale-[0.96] opacity-0";

  return (
    <div className="mx-auto mt-8 grid max-w-6xl grid-cols-2 gap-4 sm:mt-12 sm:gap-6 md:grid-cols-3 lg:grid-cols-4 lg:gap-9">
      {Array.from({ length: 12 }, (_, index) => {
        const chapter = index + 1;
        const isBlue = chapter % 2 === 1;

        return (
          <div
            key={chapter}
            className={`transition-all duration-700 ease-out ${cardAnimation}`}
            style={{ transitionDelay: `${index * 55}ms` }}
          >
            <Link
              href={`/genki/${book}/chapter/${chapter}`}
              className={`flex h-28 flex-col items-center justify-center rounded-xl px-4 text-center text-white shadow-xl transition hover:-translate-y-1 hover:brightness-105 sm:h-32 lg:h-36 ${
                isBlue
                  ? "bg-gradient-to-br from-[#92b2e8] to-[#6d94d2] shadow-blue-300/50"
                  : "bg-gradient-to-br from-[#9bcc99] to-[#78b978] shadow-green-300/50"
              }`}
            >
              <OpenBookIcon className="home-book-float h-8 w-8 text-white drop-shadow sm:h-10 sm:w-10" />

              <div className="mt-3 whitespace-nowrap text-lg font-black leading-none sm:mt-4 sm:text-2xl">
                Chapter {chapter}
              </div>
            </Link>
          </div>
        );
      })}
    </div>
  );
}