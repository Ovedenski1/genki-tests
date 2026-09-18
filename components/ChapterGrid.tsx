"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { OpenBookIcon } from "@/components/StudyIcons";

type ChapterItem = {
  key: string;
  label: string;
  href: string;
  color: "blue" | "green" | "purple";
};

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

  const chapterItems: ChapterItem[] =
    book === 2
      ? Array.from({ length: 11 }, (_, index) => {
          const databaseChapter = index + 1;
          const displayChapter = databaseChapter + 12;

          return {
            key: `chapter-${displayChapter}`,
            label: `Chapter ${displayChapter}`,
            href: `/genki/${book}/chapter/${displayChapter}`,
            color: displayChapter % 2 === 1 ? "blue" : "green",
          } satisfies ChapterItem;
        })
      : [
          {
            key: "writing",
            label: "Writing",
            href: `/genki/${book}/writing`,
            color: "purple",
          },
          {
            key: "chapter-0",
            label: "Chapter 0",
            href: `/genki/${book}/chapter/0`,
            color: "green",
          },
          ...Array.from({ length: 12 }, (_, index) => {
            const chapter = index + 1;

            return {
              key: `chapter-${chapter}`,
              label: `Chapter ${chapter}`,
              href: `/genki/${book}/chapter/${chapter}`,
              color: chapter % 2 === 1 ? "blue" : "green",
            } satisfies ChapterItem;
          }),
        ];

  function cardColors(color: ChapterItem["color"]) {
    if (color === "purple") {
      return "bg-gradient-to-br from-[#c7a4ff] to-[#8b7cf6] shadow-violet-300/50";
    }

    if (color === "green") {
      return "bg-gradient-to-br from-[#9bcc99] to-[#78b978] shadow-green-300/50";
    }

    return "bg-gradient-to-br from-[#92b2e8] to-[#6d94d2] shadow-blue-300/50";
  }

  return (
    <div className="mx-auto mt-7 grid w-full max-w-[920px] grid-cols-2 gap-4 sm:mt-8 sm:gap-5 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">
      {chapterItems.map((item, index) => (
        <div
          key={item.key}
          className={`transition-all duration-700 ease-out ${cardAnimation}`}
          style={{ transitionDelay: `${index * 45}ms` }}
        >
          <Link
            href={item.href}
            className={`flex h-[92px] flex-col items-center justify-center rounded-xl px-4 text-center text-white shadow-xl transition hover:-translate-y-1 hover:brightness-105 sm:h-[104px] lg:h-[112px] ${cardColors(
              item.color
            )}`}
          >
            <OpenBookIcon className="home-book-float h-7 w-7 text-white drop-shadow sm:h-8 sm:w-8" />

            <div className="mt-3 whitespace-nowrap text-lg font-black leading-none sm:text-xl">
              {item.label}
            </div>
          </Link>
        </div>
      ))}
    </div>
  );
}