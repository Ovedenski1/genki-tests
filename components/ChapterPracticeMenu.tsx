"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { KanjiIcon, OpenBookIcon } from "@/components/StudyIcons";
import { PracticeCard } from "@/components/PracticeCard";

export function ChapterPracticeMenu({ base }: { base: string }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [pageReady, setPageReady] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setPageReady(true);
    });

    return () => cancelAnimationFrame(frame);
  }, []);

  function openMobileModal() {
    const isMobile = window.matchMedia("(max-width: 767px)").matches;

    if (isMobile) {
      setModalOpen(true);
    }
  }

  const cardAnimation = pageReady
    ? "translate-y-0 scale-100 opacity-100"
    : "translate-y-10 scale-[0.96] opacity-0";

  return (
    <>
      <div className="mx-auto mt-10 grid max-w-4xl grid-cols-2 gap-4 sm:mt-14 sm:gap-8 lg:gap-12">
        <div
          className={`h-full transition-all duration-700 ease-out ${cardAnimation}`}
          style={{ transitionDelay: "220ms" }}
        >
          <PracticeCard
            href={`${base}/vocab`}
            title="Vocab"
            description="Study vocabulary from this chapter."
            icon="book"
            color="green"
          />
        </div>

        <div
          className={`group/kanji relative h-full w-full transition-all duration-700 ease-out ${cardAnimation}`}
          style={{ transitionDelay: "340ms" }}
        >
          <button
            type="button"
            onClick={openMobileModal}
            className="flex h-full w-full flex-col items-center justify-center rounded-xl bg-gradient-to-br from-[#92b2e8] to-[#6d94d2] px-4 py-10 text-center text-white shadow-xl shadow-blue-300/50 transition hover:-translate-y-1 hover:brightness-105 sm:px-10 sm:py-14 lg:px-16 lg:py-16"
          >
            <div className="home-book-float mx-auto flex h-12 w-12 items-center justify-center rounded-xl border-4 border-white text-white sm:h-16 sm:w-16 lg:h-20 lg:w-20">
              <KanjiIcon className="text-4xl font-black leading-none sm:text-5xl lg:text-6xl" />
            </div>

            <h2 className="mt-5 text-3xl font-black sm:mt-8 sm:text-4xl lg:text-5xl">
              Kanji
            </h2>

            <p className="mt-4 hidden text-lg text-white/90 sm:block lg:mt-8 lg:text-xl">
              Study kanji from this chapter.
            </p>
          </button>

          <div className="pointer-events-none absolute left-full top-0 z-40 hidden h-full w-36 pl-3 opacity-0 transition-opacity duration-150 group-hover/kanji:pointer-events-auto group-hover/kanji:opacity-100 md:block lg:w-40">
            <div className="grid h-full grid-rows-3 gap-2">
              <Link
                href={`${base}/kanji?mode=vocab`}
                className="flex translate-x-6 scale-90 items-center justify-center rounded-xl bg-gradient-to-br from-[#9bcc99] to-[#78b978] text-lg font-black text-white opacity-0 shadow-xl shadow-green-300/50 transition duration-200 ease-out hover:-translate-y-0.5 hover:brightness-105 group-hover/kanji:translate-x-0 group-hover/kanji:scale-100 group-hover/kanji:opacity-100"
                style={{ transitionDelay: "40ms" }}
              >
                Vocab
              </Link>

              <Link
                href={`${base}/kanji?mode=back`}
                className="flex translate-x-6 scale-90 items-center justify-center rounded-xl bg-gradient-to-br from-[#92b2e8] to-[#6d94d2] text-lg font-black text-white opacity-0 shadow-xl shadow-blue-300/50 transition duration-200 ease-out hover:-translate-y-0.5 hover:brightness-105 group-hover/kanji:translate-x-0 group-hover/kanji:scale-100 group-hover/kanji:opacity-100"
                style={{ transitionDelay: "110ms" }}
              >
                Back
              </Link>

              <Link
                href={`${base}/kanji`}
                className="flex translate-x-6 scale-90 items-center justify-center rounded-xl bg-gradient-to-br from-[#c7a4ff] to-[#8b7cf6] text-lg font-black text-white opacity-0 shadow-xl shadow-violet-300/50 transition duration-200 ease-out hover:-translate-y-0.5 hover:brightness-105 group-hover/kanji:translate-x-0 group-hover/kanji:scale-100 group-hover/kanji:opacity-100"
                style={{ transitionDelay: "180ms" }}
              >
                All
              </Link>
            </div>
          </div>
        </div>
      </div>

      {modalOpen ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#173763]/35 px-4 backdrop-blur-sm md:hidden">
          <div className="soft-pop w-full max-w-xs rounded-2xl bg-white p-5 text-center shadow-2xl">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-[#92b2e8] to-[#6d94d2] text-white shadow-lg shadow-blue-300/50">
              <OpenBookIcon className="h-8 w-8" />
            </div>

            <h2 className="mt-4 text-3xl font-black text-[#173763]">
              Kanji
            </h2>

            <p className="mt-1 text-sm font-semibold text-slate-500">
              Choose mode
            </p>

            <div className="mt-5 grid gap-3">
              <Link
                href={`${base}/kanji?mode=vocab`}
                className="mobile-modal-option rounded-xl bg-gradient-to-br from-[#9bcc99] to-[#78b978] px-4 py-4 text-lg font-black text-white shadow-lg shadow-green-300/50"
                style={{ animationDelay: "40ms" }}
              >
                Vocab
              </Link>

              <Link
                href={`${base}/kanji?mode=back`}
                className="mobile-modal-option rounded-xl bg-gradient-to-br from-[#92b2e8] to-[#6d94d2] px-4 py-4 text-lg font-black text-white shadow-lg shadow-blue-300/50"
                style={{ animationDelay: "120ms" }}
              >
                Back
              </Link>

              <Link
                href={`${base}/kanji`}
                className="mobile-modal-option rounded-xl bg-gradient-to-br from-[#c7a4ff] to-[#8b7cf6] px-4 py-4 text-lg font-black text-white shadow-lg shadow-violet-300/50"
                style={{ animationDelay: "200ms" }}
              >
                All
              </Link>
            </div>

            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="mt-5 text-sm font-black text-slate-500 hover:text-[#173763]"
            >
              Close
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}