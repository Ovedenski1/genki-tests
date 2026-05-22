"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { PageShell } from "@/components/ui/PageShell";
import { ResultTable } from "@/components/ResultTable";
import { fetchWords } from "@/lib/queries";
import {
  isCorrectAnswer,
  mainAnswer,
  promptText,
  resultReading,
} from "@/lib/normalizeAnswer";
import { shuffle } from "@/utils/shuffle";
import type {
  GenkiWord,
  KanjiMode,
  WordType,
  TypingResult,
} from "@/types/genki";

function secondsPerWord(type: WordType) {
  return type === "kanji" ? 8 : 10;
}

export function TypingTest({
  book,
  chapter,
  wordType,
  kanjiMode = "all",
  title,
}: {
  book: number;
  chapter: number;
  wordType: WordType;
  kanjiMode?: KanjiMode;
  title: string;
}) {
  const [words, setWords] = useState<GenkiWord[]>([]);
  const [queue, setQueue] = useState<GenkiWord[]>([]);
  const [answer, setAnswer] = useState("");
  const [results, setResults] = useState<TypingResult[]>([]);
  const [feedback, setFeedback] = useState<"right" | "wrong" | null>(null);
  const [loading, setLoading] = useState(true);
  const [finished, setFinished] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const correctSoundRef = useRef<HTMLAudioElement | null>(null);
  const wrongSoundRef = useRef<HTMLAudioElement | null>(null);
  const skipSoundRef = useRef<HTMLAudioElement | null>(null);

  const current = queue[0];

  const score = results.filter((result) => result.correct).length;
  const totalTime = words.length * secondsPerWord(wordType);
  const timeUsed = Math.max(0, totalTime - secondsLeft);

  const progressNumber = Math.min(
    words.length,
    results.length + (feedback ? 0 : 1)
  );

  useEffect(() => {
    correctSoundRef.current = new Audio("/sounds/correct.wav");
    wrongSoundRef.current = new Audio("/sounds/wrong.mp3");
    skipSoundRef.current = new Audio("/sounds/skip.mp3");

    correctSoundRef.current.volume = 0.65;
    wrongSoundRef.current.volume = 0.65;
    skipSoundRef.current.volume = 0.55;
  }, []);

  useEffect(() => {
    async function load() {
      setLoading(true);

      try {
        const data = await fetchWords(book, chapter, wordType, kanjiMode);
        const shuffledWords = shuffle(data);

        setWords(data);
        setQueue(shuffledWords);
        setAnswer("");
        setResults([]);
        setFeedback(null);
        setFinished(false);
        setSecondsLeft(data.length * secondsPerWord(wordType));
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [book, chapter, wordType, kanjiMode]);

  useEffect(() => {
    if (loading || finished || feedback || words.length === 0) return;

    if (secondsLeft <= 0) {
      finishWithMissed();
      return;
    }

    const timer = window.setTimeout(() => {
      setSecondsLeft((value) => Math.max(0, value - 1));
    }, 1000);

    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, finished, feedback, words.length, secondsLeft]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [current, feedback]);

  function playSound(sound: HTMLAudioElement | null) {
    if (!sound) return;

    sound.currentTime = 0;
    sound.play().catch(() => {
      // Browser may block sound if there was no user interaction yet.
    });
  }

  function playAnswerSound(correct: boolean) {
    playSound(correct ? correctSoundRef.current : wrongSoundRef.current);
  }

  function playSkipSound() {
    playSound(skipSoundRef.current);
  }

  function formatTime(total: number) {
    const minutes = Math.floor(total / 60).toString().padStart(2, "0");
    const secs = (total % 60).toString().padStart(2, "0");
    return `${minutes}:${secs}`;
  }

  function finishWithMissed() {
    if (finished) return;

    setFinished(true);
    setFeedback(null);

    setResults((old) => {
      const missed = queue.map((word) => ({
        prompt: promptText(word, wordType),
        expected: mainAnswer(word, wordType),
        userAnswer: "",
        reading: resultReading(word, wordType),
        correct: false,
      }));

      return [...old, ...missed];
    });
  }

  function recordAnswer(userAnswer: string) {
    if (!current || feedback || finished) return;

    const answeredWord = current;
    const correct = isCorrectAnswer(userAnswer, answeredWord, wordType);
    const isLastWord = queue.length <= 1;

    setFeedback(correct ? "right" : "wrong");
    playAnswerSound(correct);

    const result: TypingResult = {
      prompt: promptText(answeredWord, wordType),
      expected: mainAnswer(answeredWord, wordType),
      userAnswer,
      reading: resultReading(answeredWord, wordType),
      correct,
    };

    setResults((old) => [...old, result]);

    window.setTimeout(() => {
      setQueue((old) => old.slice(1));
      setAnswer("");
      setFeedback(null);

      if (isLastWord) {
        setFinished(true);
      }
    }, 650);
  }

  function skipWord() {
    if (!current || feedback || finished) return;

    playSkipSound();
    setAnswer("");

    setQueue((old) => {
      if (old.length <= 1) return old;

      const [firstWord, ...rest] = old;
      return [...rest, firstWord];
    });

    window.setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  }

  function restart() {
    setQueue(shuffle(words));
    setAnswer("");
    setResults([]);
    setFeedback(null);
    setFinished(false);
    setSecondsLeft(words.length * secondsPerWord(wordType));
  }

  if (loading) {
    return (
      <PageShell>
        <Card className="mx-auto max-w-xl p-8 text-center text-xl font-black sm:p-10 sm:text-2xl">
          Loading...
        </Card>
      </PageShell>
    );
  }

  if (words.length === 0) {
    return (
      <PageShell>
        <Card className="mx-auto max-w-xl p-8 text-center sm:p-10">
          <h1 className="text-3xl font-black text-[#173763] sm:text-4xl">
            No words yet
          </h1>

          <p className="mt-4 text-base text-slate-500 sm:text-xl">
            Add words from the admin page.
          </p>

          <Link
            href="/admin"
            className="mt-6 inline-flex text-lg font-black text-[#173763] hover:underline sm:text-xl"
          >
            Go to admin
          </Link>
        </Card>
      </PageShell>
    );
  }

  if (finished) {
    return (
      <PageShell>
        <div className="mx-auto max-w-6xl 2xl:max-w-[1500px]">
          <Link
            href={`/genki/${book}/chapter/${chapter}`}
            className="text-base font-bold text-[#173763] hover:underline sm:text-xl"
          >
            ← Back to Chapter
          </Link>

          <section className="mt-8 text-center sm:mt-10">
            <h1 className="text-5xl font-black text-[#173763] sm:text-6xl 2xl:text-7xl">
              Results
            </h1>

            <div className="mx-auto mt-8 grid max-w-3xl grid-cols-2 gap-4 sm:mt-10 sm:gap-6 2xl:max-w-5xl">
              <Card className="p-5 sm:p-6 2xl:p-8">
                <p className="text-base text-slate-500 sm:text-xl 2xl:text-2xl">
                  Score
                </p>

                <p className="mt-2 text-3xl font-black text-[#173763] sm:text-5xl 2xl:text-6xl">
                  {score} / {results.length}
                </p>
              </Card>

              <Card className="p-5 sm:p-6 2xl:p-8">
                <p className="text-base text-slate-500 sm:text-xl 2xl:text-2xl">
                  Time used
                </p>

                <p className="mt-2 text-3xl font-black text-[#173763] sm:text-5xl 2xl:text-6xl">
                  {formatTime(timeUsed)}
                </p>
              </Card>
            </div>

            <div className="mt-8 sm:mt-10">
              <ResultTable results={results} />
            </div>

            <div className="mt-8 flex justify-center gap-4 sm:mt-10 sm:gap-5">
              <Button variant="green" onClick={restart}>
                Restart
              </Button>

              <Link
                href={`/genki/${book}/chapter/${chapter}`}
                className="rounded-xl bg-gradient-to-br from-[#92b2e8] to-[#6d94d2] px-6 py-3 text-base font-black text-white shadow-lg shadow-blue-200/60 sm:px-8 sm:py-4 sm:text-xl"
              >
                Back
              </Link>
            </div>
          </section>
        </div>
      </PageShell>
    );
  }

  if (!current) {
    return (
      <PageShell>
        <Card className="mx-auto max-w-xl p-8 text-center text-xl font-black sm:p-10 sm:text-2xl">
          Preparing...
        </Card>
      </PageShell>
    );
  }

  const cardColor =
    feedback === "right"
      ? "border-4 border-green-300 bg-green-50 shadow-green-200/80"
      : feedback === "wrong"
        ? "border-4 border-rose-300 bg-rose-50 shadow-rose-200/80"
        : "border border-slate-200/70 bg-white/88 shadow-slate-200/70";

  return (
    <PageShell>
      <div className="mx-auto max-w-5xl 2xl:max-w-7xl">
        <Link
          href={`/genki/${book}/chapter/${chapter}`}
          className="text-base font-bold text-[#173763] hover:underline sm:text-xl"
        >
          ← Back to Chapter
        </Link>

        <section className="mt-8 text-center sm:mt-10">
          <h1 className="text-4xl font-black tracking-wide text-[#173763] sm:text-6xl lg:text-7xl 2xl:text-8xl">
            Chapter {chapter} — {title}
          </h1>

          <p className="mt-4 text-lg text-slate-600 sm:text-2xl lg:text-3xl 2xl:text-4xl">
            {wordType === "kanji"
              ? "Type the hiragana reading for the kanji."
              : "Type the Japanese word for the English prompt."}
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-4 sm:mt-10 sm:gap-8 lg:gap-10">
            <div className="rounded-xl bg-white/90 px-5 py-3 text-lg font-black text-[#173763] shadow-lg shadow-slate-200/70 sm:px-8 sm:py-4 sm:text-2xl 2xl:text-3xl">
              📖 {progressNumber} / {words.length}
            </div>

            <div className="rounded-xl bg-white/90 px-5 py-3 text-lg font-black text-[#173763] shadow-lg shadow-slate-200/70 sm:px-8 sm:py-4 sm:text-2xl 2xl:text-3xl">
              ◷ {formatTime(secondsLeft)}
            </div>

            <Button
              type="button"
              variant="danger"
              className="text-base sm:text-xl 2xl:text-2xl"
              onClick={finishWithMissed}
              disabled={Boolean(feedback)}
            >
              End test
            </Button>
          </div>

          <Card
            className={`soft-pop relative mx-auto mt-8 max-w-3xl p-6 transition-all duration-200 sm:mt-10 sm:p-10 2xl:max-w-5xl 2xl:p-14 ${cardColor}`}
          >
            {feedback ? (
              <div
                className={`absolute right-4 top-4 flex h-14 w-14 items-center justify-center rounded-full text-4xl font-black text-white shadow-xl sm:right-6 sm:top-6 sm:h-20 sm:w-20 sm:text-6xl ${
                  feedback === "right"
                    ? "bg-green-500 shadow-green-300/70"
                    : "bg-rose-500 shadow-rose-300/70"
                }`}
              >
                {feedback === "right" ? "✓" : "×"}
              </div>
            ) : null}

            <h2 className="text-4xl font-black tracking-wide text-[#173763] sm:text-6xl 2xl:text-7xl">
              {promptText(current, wordType)}
            </h2>

            <Input
              ref={inputRef}
              value={answer}
              disabled={Boolean(feedback)}
              onChange={(event) => setAnswer(event.target.value)}
              onKeyDown={(event) => {
                if (event.nativeEvent.isComposing) return;

                if (event.key === "Enter") {
                  recordAnswer(answer);
                }

                if (event.key === " ") {
                  event.preventDefault();
                  skipWord();
                }
              }}
              className="mt-8 text-2xl sm:mt-10 sm:text-3xl 2xl:text-4xl"
              placeholder="Type in Japanese..."
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
            />

            <div className="mt-6 grid grid-cols-1 gap-4 sm:mt-8 sm:grid-cols-2 sm:gap-8">
              <Button
                type="button"
                variant="green"
                className="text-lg sm:text-2xl 2xl:text-3xl"
                onClick={() => recordAnswer(answer)}
                disabled={Boolean(feedback)}
              >
                Check
              </Button>

              <Button
                type="button"
                variant="blue"
                className="text-lg sm:text-2xl 2xl:text-3xl"
                onClick={skipWord}
                disabled={Boolean(feedback)}
              >
                Skip
              </Button>
            </div>
          </Card>
        </section>
      </div>
    </PageShell>
  );
}