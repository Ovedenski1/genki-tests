"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { OpenBookIcon } from "@/components/StudyIcons";

export default function HomePage() {
  const [mobileJojoActive, setMobileJojoActive] = useState(false);
  const [pageReady, setPageReady] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setPageReady(true);
    });

    return () => cancelAnimationFrame(frame);
  }, []);

  function handleGenki2Click() {
    setMobileJojoActive(true);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setMobileJojoActive(false);
    }, 1500);
  }

  const titleAnimation = pageReady
    ? "translate-y-0 scale-100 opacity-100"
    : "-translate-y-8 scale-[0.98] opacity-0";

  const textAnimation = pageReady
    ? "translate-y-0 opacity-100"
    : "translate-y-6 opacity-0";

  const cardAnimation = pageReady
    ? "translate-y-0 scale-100 opacity-100"
    : "translate-y-10 scale-[0.96] opacity-0";

  return (
    <main className="flex flex-1 items-center justify-center">
      <section className="mx-auto flex min-h-[calc(100svh-175px)] w-full max-w-6xl flex-col items-center justify-center px-4 pb-8 pt-6 text-center sm:px-6 sm:pb-10 sm:pt-8">
        <h1
          className={`text-4xl font-black leading-tight tracking-wide text-[#173763] drop-shadow-sm transition-all duration-700 ease-out sm:text-6xl lg:text-7xl ${titleAnimation}`}
        >
          Learn Japanese
          <br />
          Vocabulary & Kanji
        </h1>

        <p
          className={`mt-5 max-w-4xl text-base leading-relaxed text-slate-600 transition-all duration-700 ease-out sm:mt-6 sm:text-2xl lg:text-3xl ${textAnimation}`}
          style={{ transitionDelay: "140ms" }}
        >
          A free, unofficial study helper for practicing Japanese vocabulary and
          kanji through typing.
        </p>

        <div className="mt-8 grid w-full max-w-[820px] grid-cols-2 gap-5 sm:mt-10 sm:gap-10">
          <div
            className={`transition-all duration-700 ease-out ${cardAnimation}`}
            style={{ transitionDelay: "280ms" }}
          >
            <Link
              href="/genki/1/chapters"
              className="flex h-[155px] flex-col items-center justify-center rounded-xl bg-gradient-to-br from-[#92b2e8] to-[#6d94d2] px-4 text-white shadow-xl shadow-blue-300/50 transition hover:-translate-y-1 hover:brightness-105 sm:h-[195px] lg:h-[215px]"
            >
              <OpenBookIcon className="home-book-float mx-auto h-10 w-10 text-white drop-shadow sm:h-12 sm:w-12 lg:h-14 lg:w-14" />

              <div className="mt-4 text-2xl font-black sm:mt-5 sm:text-3xl lg:text-4xl">
                Genki 1
              </div>
            </Link>
          </div>

          <div
            className={`transition-all duration-700 ease-out ${cardAnimation}`}
            style={{ transitionDelay: "420ms" }}
          >
            <div
              role="button"
              tabIndex={0}
              aria-disabled="true"
              onClick={handleGenki2Click}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  handleGenki2Click();
                }
              }}
              className={`genki2-card relative flex h-[155px] cursor-not-allowed flex-col items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-[#9bcc99] to-[#78b978] px-4 text-white shadow-xl shadow-green-300/50 transition hover:-translate-y-1 hover:brightness-105 sm:h-[195px] lg:h-[215px] ${
                mobileJojoActive ? "mobile-jojo-active" : ""
              }`}
            >
              <div className="genki2-grey absolute inset-0 z-10 bg-slate-500/65 opacity-0 transition duration-300" />

              <div className="genki2-content relative z-0 transition duration-300">
                <OpenBookIcon className="home-book-float mx-auto h-10 w-10 text-white drop-shadow sm:h-12 sm:w-12 lg:h-14 lg:w-14" />

                <div className="mt-4 text-2xl font-black sm:mt-5 sm:text-3xl lg:text-4xl">
                  Genki 2
                </div>
              </div>

              <div className="jojo-hover-wrap pointer-events-none absolute bottom-5 right-2 z-20 sm:bottom-7 sm:right-7">
                <div className="text-right font-black uppercase leading-none text-[#111827] drop-shadow-sm">
                  <p className="text-[10px] tracking-[0.25em] sm:text-lg">
                    つづく
                  </p>

                  <p className="mt-2 whitespace-nowrap text-[10px] tracking-wide sm:mt-3 sm:text-2xl lg:text-3xl">
                    To Be Continued
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}