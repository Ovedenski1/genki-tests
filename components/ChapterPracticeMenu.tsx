"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { KanjiIcon, OpenBookIcon } from "@/components/StudyIcons";
import { fetchStudyLists } from "@/lib/queries";
import type { StudyList } from "@/types/genki";

type ModalMode = "vocab" | "kanji" | "extra" | null;

export function ChapterPracticeMenu({
  base,
  book,
  chapter,
}: {
  base: string;
  book: number;
  chapter: number;
}) {
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [pageReady, setPageReady] = useState(false);
  const [studyLists, setStudyLists] = useState<StudyList[]>([]);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setPageReady(true);
    });

    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    async function loadLists() {
      try {
        const lists = await fetchStudyLists(book, chapter);
        setStudyLists(lists);
      } catch {
        setStudyLists([]);
      }
    }

    loadLists();
  }, [book, chapter]);

  function openMobileModal(mode: Exclude<ModalMode, null>) {
    const isMobile = window.matchMedia("(max-width: 767px)").matches;

    if (isMobile) {
      setModalMode(mode);
    }
  }

  const cardAnimation = pageReady
    ? "translate-y-0 scale-100 opacity-100"
    : "translate-y-10 scale-[0.96] opacity-0";

  const hasOneExtraList = studyLists.length === 1;
  const hasManyExtraLists = studyLists.length > 1;

  return (
    <>
      <div className="mx-auto mt-8 grid w-full max-w-[760px] grid-cols-2 gap-4 sm:mt-9 sm:gap-7 lg:gap-8">
        <div
          className={`group/vocab relative h-full w-full transition-all duration-700 ease-out ${cardAnimation}`}
          style={{ transitionDelay: "220ms" }}
        >
          <button
            type="button"
            onClick={() => openMobileModal("vocab")}
            className="flex h-[220px] w-full flex-col items-center justify-center rounded-xl bg-gradient-to-br from-[#9bcc99] to-[#78b978] px-4 text-center text-white shadow-xl shadow-green-300/50 transition hover:-translate-y-1 hover:brightness-105 sm:h-[250px] lg:h-[285px]"
          >
            <div className="home-book-float mx-auto flex h-12 w-12 items-center justify-center text-white sm:h-14 sm:w-14 lg:h-16 lg:w-16">
              <OpenBookIcon className="h-12 w-12 sm:h-14 sm:w-14 lg:h-16 lg:w-16" />
            </div>

            <h2 className="mt-5 text-3xl font-black sm:mt-6 sm:text-4xl">
              Vocab
            </h2>

            <p className="mt-4 hidden max-w-[230px] text-base leading-snug text-white/90 sm:block lg:mt-6 lg:text-lg">
              Study vocabulary from this chapter.
            </p>
          </button>

          <DesktopVocabMenu
            base={base}
            studyLists={studyLists}
            hasOneExtraList={hasOneExtraList}
            hasManyExtraLists={hasManyExtraLists}
          />
        </div>

        <div
          className={`group/kanji relative h-full w-full transition-all duration-700 ease-out ${cardAnimation}`}
          style={{ transitionDelay: "340ms" }}
        >
          <button
            type="button"
            onClick={() => openMobileModal("kanji")}
            className="flex h-[220px] w-full flex-col items-center justify-center rounded-xl bg-gradient-to-br from-[#92b2e8] to-[#6d94d2] px-4 text-center text-white shadow-xl shadow-blue-300/50 transition hover:-translate-y-1 hover:brightness-105 sm:h-[250px] lg:h-[285px]"
          >
            <div className="home-book-float mx-auto flex h-12 w-12 items-center justify-center rounded-xl border-4 border-white text-white sm:h-14 sm:w-14 lg:h-16 lg:w-16">
              <KanjiIcon className="text-4xl font-black leading-none sm:text-5xl" />
            </div>

            <h2 className="mt-5 text-3xl font-black sm:mt-6 sm:text-4xl">
              Kanji
            </h2>

            <p className="mt-4 hidden max-w-[230px] text-base leading-snug text-white/90 sm:block lg:mt-6 lg:text-lg">
              Study kanji from this chapter.
            </p>
          </button>

          <DesktopKanjiMenu base={base} />
        </div>
      </div>

      {modalMode === "vocab" ? (
        <MobileVocabModal
          base={base}
          studyLists={studyLists}
          hasOneExtraList={hasOneExtraList}
          hasManyExtraLists={hasManyExtraLists}
          onShowExtra={() => setModalMode("extra")}
          onClose={() => setModalMode(null)}
        />
      ) : null}

      {modalMode === "extra" ? (
        <MobileExtraModal
          base={base}
          studyLists={studyLists}
          onBack={() => setModalMode("vocab")}
          onClose={() => setModalMode(null)}
        />
      ) : null}

      {modalMode === "kanji" ? (
        <MobileKanjiModal base={base} onClose={() => setModalMode(null)} />
      ) : null}
    </>
  );
}

function DesktopVocabMenu({
  base,
  studyLists,
  hasOneExtraList,
  hasManyExtraLists,
}: {
  base: string;
  studyLists: StudyList[];
  hasOneExtraList: boolean;
  hasManyExtraLists: boolean;
}) {
  return (
    <div className="pointer-events-none absolute right-full top-0 z-40 hidden h-full w-32 pr-3 opacity-0 transition-opacity duration-150 group-hover/vocab:pointer-events-auto group-hover/vocab:opacity-100 md:block lg:w-36">
      <div className="grid h-full auto-rows-fr gap-2">
        <SideLink
          href={`${base}/vocab`}
          color="green"
          delay="40ms"
          parent="vocab"
          direction="left"
        >
          Main
        </SideLink>

        {hasOneExtraList ? (
          <SideLink
            href={`${base}/vocab?list=${
              studyLists[0].id
            }&title=${encodeURIComponent(studyLists[0].name)}`}
            color="blue"
            delay="110ms"
            parent="vocab"
            direction="left"
          >
            {studyLists[0].name}
          </SideLink>
        ) : null}

        {hasManyExtraLists ? (
          <div
            className="group/extra relative flex translate-x-6 scale-90 items-center justify-center rounded-xl bg-gradient-to-br from-[#92b2e8] to-[#6d94d2] px-2 text-center text-base font-black text-white opacity-0 shadow-xl shadow-blue-300/50 transition duration-200 ease-out hover:-translate-y-0.5 hover:brightness-105 group-hover/vocab:translate-x-0 group-hover/vocab:scale-100 group-hover/vocab:opacity-100"
            style={{ transitionDelay: "110ms" }}
          >
            Extra

            <div className="pointer-events-none absolute right-full top-0 z-50 w-44 pr-3 opacity-0 transition-opacity duration-150 group-hover/extra:pointer-events-auto group-hover/extra:opacity-100">
              <div className="grid gap-2">
                {studyLists.map((list, index) => (
                  <Link
                    key={list.id}
                    href={`${base}/vocab?list=${
                      list.id
                    }&title=${encodeURIComponent(list.name)}`}
                    className="flex min-h-12 translate-x-6 scale-90 items-center justify-center rounded-xl bg-gradient-to-br from-[#92b2e8] to-[#6d94d2] px-3 text-center text-sm font-black text-white opacity-0 shadow-xl shadow-blue-300/50 transition duration-200 ease-out hover:-translate-y-0.5 hover:brightness-105 group-hover/extra:translate-x-0 group-hover/extra:scale-100 group-hover/extra:opacity-100"
                    style={{ transitionDelay: `${index * 55 + 40}ms` }}
                  >
                    {list.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        ) : null}

        <SideLink
          href={`${base}/vocab?scope=all&title=${encodeURIComponent(
            "All Vocab"
          )}`}
          color="purple"
          delay="180ms"
          parent="vocab"
          direction="left"
        >
          All
        </SideLink>
      </div>
    </div>
  );
}

function DesktopKanjiMenu({ base }: { base: string }) {
  return (
    <div className="pointer-events-none absolute left-full top-0 z-40 hidden h-full w-32 pl-3 opacity-0 transition-opacity duration-150 group-hover/kanji:pointer-events-auto group-hover/kanji:opacity-100 md:block lg:w-36">
      <div className="grid h-full grid-rows-3 gap-2">
        <SideLink
          href={`${base}/kanji?mode=vocab`}
          color="green"
          delay="40ms"
          parent="kanji"
          direction="right"
        >
          Vocab
        </SideLink>

        <SideLink
          href={`${base}/kanji?mode=back`}
          color="blue"
          delay="110ms"
          parent="kanji"
          direction="right"
        >
          Back
        </SideLink>

        <SideLink
          href={`${base}/kanji`}
          color="purple"
          delay="180ms"
          parent="kanji"
          direction="right"
        >
          All
        </SideLink>
      </div>
    </div>
  );
}

function SideLink({
  href,
  children,
  color,
  delay,
  parent,
  direction,
}: {
  href: string;
  children: React.ReactNode;
  color: "green" | "blue" | "purple";
  delay: string;
  parent: "vocab" | "kanji";
  direction: "left" | "right";
}) {
  const colors = {
    green: "from-[#9bcc99] to-[#78b978] shadow-green-300/50",
    blue: "from-[#92b2e8] to-[#6d94d2] shadow-blue-300/50",
    purple: "from-[#c7a4ff] to-[#8b7cf6] shadow-violet-300/50",
  };

  const startPosition =
    direction === "left" ? "translate-x-6" : "-translate-x-6";

  const groupClass =
    parent === "vocab"
      ? "group-hover/vocab:translate-x-0 group-hover/vocab:scale-100 group-hover/vocab:opacity-100"
      : "group-hover/kanji:translate-x-0 group-hover/kanji:scale-100 group-hover/kanji:opacity-100";

  return (
    <Link
      href={href}
      className={`flex ${startPosition} scale-90 items-center justify-center rounded-xl bg-gradient-to-br ${colors[color]} px-2 text-center text-base font-black text-white opacity-0 shadow-xl transition duration-200 ease-out hover:-translate-y-0.5 hover:brightness-105 ${groupClass}`}
      style={{ transitionDelay: delay }}
    >
      {children}
    </Link>
  );
}

function MobileVocabModal({
  base,
  studyLists,
  hasOneExtraList,
  hasManyExtraLists,
  onShowExtra,
  onClose,
}: {
  base: string;
  studyLists: StudyList[];
  hasOneExtraList: boolean;
  hasManyExtraLists: boolean;
  onShowExtra: () => void;
  onClose: () => void;
}) {
  return (
    <MobileModalShell title="Vocab" subtitle="Choose mode" onClose={onClose}>
      <Link
        href={`${base}/vocab`}
        className="mobile-modal-option rounded-xl bg-gradient-to-br from-[#9bcc99] to-[#78b978] px-4 py-4 text-lg font-black text-white shadow-lg shadow-green-300/50"
        style={{ animationDelay: "40ms" }}
      >
        Main
      </Link>

      {hasOneExtraList ? (
        <Link
          href={`${base}/vocab?list=${
            studyLists[0].id
          }&title=${encodeURIComponent(studyLists[0].name)}`}
          className="mobile-modal-option rounded-xl bg-gradient-to-br from-[#92b2e8] to-[#6d94d2] px-4 py-4 text-lg font-black text-white shadow-lg shadow-blue-300/50"
          style={{ animationDelay: "120ms" }}
        >
          {studyLists[0].name}
        </Link>
      ) : null}

      {hasManyExtraLists ? (
        <button
          type="button"
          onClick={onShowExtra}
          className="mobile-modal-option rounded-xl bg-gradient-to-br from-[#92b2e8] to-[#6d94d2] px-4 py-4 text-lg font-black text-white shadow-lg shadow-blue-300/50"
          style={{ animationDelay: "120ms" }}
        >
          Extra
        </button>
      ) : null}

      <Link
        href={`${base}/vocab?scope=all&title=${encodeURIComponent(
          "All Vocab"
        )}`}
        className="mobile-modal-option rounded-xl bg-gradient-to-br from-[#c7a4ff] to-[#8b7cf6] px-4 py-4 text-lg font-black text-white shadow-lg shadow-violet-300/50"
        style={{ animationDelay: "200ms" }}
      >
        All
      </Link>
    </MobileModalShell>
  );
}

function MobileExtraModal({
  base,
  studyLists,
  onBack,
  onClose,
}: {
  base: string;
  studyLists: StudyList[];
  onBack: () => void;
  onClose: () => void;
}) {
  return (
    <MobileModalShell title="Extra" subtitle="Choose list" onClose={onClose}>
      {studyLists.map((list, index) => (
        <Link
          key={list.id}
          href={`${base}/vocab?list=${list.id}&title=${encodeURIComponent(
            list.name
          )}`}
          className="mobile-modal-option rounded-xl bg-gradient-to-br from-[#92b2e8] to-[#6d94d2] px-4 py-4 text-lg font-black text-white shadow-lg shadow-blue-300/50"
          style={{ animationDelay: `${index * 80 + 40}ms` }}
        >
          {list.name}
        </Link>
      ))}

      <button
        type="button"
        onClick={onBack}
        className="mt-1 text-sm font-black text-slate-500 hover:text-[#173763]"
      >
        ← Back
      </button>
    </MobileModalShell>
  );
}

function MobileKanjiModal({
  base,
  onClose,
}: {
  base: string;
  onClose: () => void;
}) {
  return (
    <MobileModalShell title="Kanji" subtitle="Choose mode" onClose={onClose}>
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
    </MobileModalShell>
  );
}

function MobileModalShell({
  title,
  subtitle,
  children,
  onClose,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#173763]/35 px-4 backdrop-blur-sm md:hidden">
      <div className="soft-pop w-full max-w-xs rounded-2xl bg-white p-5 text-center shadow-2xl">
        <h2 className="text-3xl font-black text-[#173763]">{title}</h2>

        <p className="mt-1 text-sm font-semibold text-slate-500">
          {subtitle}
        </p>

        <div className="mt-5 grid gap-3">{children}</div>

        <button
          type="button"
          onClick={onClose}
          className="mt-5 text-sm font-black text-slate-500 hover:text-[#173763]"
        >
          Close
        </button>
      </div>
    </div>
  );
}