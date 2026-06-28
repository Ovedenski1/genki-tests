"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { toHiragana, toKatakana } from "wanakana";
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

type InputMode = "english" | "hiragana" | "katakana";

function secondsPerWord(type: WordType) {
  return type === "kanji" ? 8 : 10;
}

function convertDraftKana(value: string, mode: InputMode) {
  if (mode === "english") return value;

  return mode === "hiragana"
    ? toHiragana(value, { IMEMode: true })
    : toKatakana(value, { IMEMode: true });
}

function convertFinalKana(value: string, mode: InputMode) {
  if (mode === "english") return value;

  return mode === "hiragana" ? toHiragana(value) : toKatakana(value);
}

function nextInputMode(mode: InputMode): InputMode {
  if (mode === "english") return "hiragana";
  if (mode === "hiragana") return "katakana";
  return "english";
}

function modeIndex(mode: InputMode) {
  if (mode === "english") return 0;
  if (mode === "hiragana") return 1;
  return 2;
}

function InputModeSwitch({
  inputMode,
  onChange,
}: {
  inputMode: InputMode;
  onChange: (mode: InputMode) => void;
}) {
  const activeIndex = modeIndex(inputMode);

  const labels: { mode: InputMode; label: string }[] = [
    { mode: "english", label: "A" },
    { mode: "hiragana", label: "あ" },
    { mode: "katakana", label: "ア" },
  ];

  return (
    <div className="relative flex h-12 w-44 items-center rounded-full bg-slate-100 p-1 shadow-inner shadow-slate-300/60">
      <div
        className="absolute left-1 top-1 h-10 rounded-full bg-gradient-to-br from-[#9bcc99] to-[#78b978] shadow-md shadow-green-300/60 transition-transform duration-300 ease-out"
        style={{
          width: "calc((100% - 0.5rem) / 3)",
          transform: `translateX(${activeIndex * 100}%)`,
        }}
      />

      {labels.map((item) => (
        <button
          key={item.mode}
          type="button"
          onClick={() => onChange(item.mode)}
          className={`relative z-10 flex h-10 flex-1 items-center justify-center rounded-full text-xl font-black transition ${
            inputMode === item.mode ? "text-white" : "text-slate-400"
          }`}
          aria-label={`Switch to ${item.mode} input`}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

export function TypingTest({
  book,
  chapter,
  wordType,
  kanjiMode = "all",
  studyListId = null,
  includeExtraVocab = false,
  title,
}: {
  book: number;
  chapter: number;
  wordType: WordType;
  kanjiMode?: KanjiMode;
  studyListId?: string | null;
  includeExtraVocab?: boolean;
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
  const [inputMode, setInputMode] = useState<InputMode>("hiragana");

  const inputRef = useRef<HTMLInputElement | null>(null);
  const correctSoundRef = useRef<HTMLAudioElement | null>(null);
  const wrongSoundRef = useRef<HTMLAudioElement | null>(null);
  const skipSoundRef = useRef<HTMLAudioElement | null>(null);
  const switchSoundRef = useRef<HTMLAudioElement | null>(null);
const shiftWasAloneRef = useRef(false);
const segmentStartRef = useRef(0);

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
    switchSoundRef.current = new Audio("/sounds/switch.wav");

    correctSoundRef.current.volume = 0.65;
    wrongSoundRef.current.volume = 0.65;
    skipSoundRef.current.volume = 0.55;
    switchSoundRef.current.volume = 0.5;
  }, []);

  useEffect(() => {
    async function load() {
      setLoading(true);

      try {
        const data = await fetchWords(
          book,
          chapter,
          wordType,
          kanjiMode,
          studyListId,
          includeExtraVocab
        );

        const shuffledWords = shuffle(data);

        setWords(data);
        setQueue(shuffledWords);
        setAnswer("");
        setResults([]);
        setFeedback(null);
        setFinished(false);
        setSecondsLeft(data.length * secondsPerWord(wordType));
        segmentStartRef.current = 0;
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [book, chapter, wordType, kanjiMode, studyListId, includeExtraVocab]);

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

  function playSwitchSound() {
    playSound(switchSoundRef.current);
  }

  function formatTime(total: number) {
    const minutes = Math.floor(total / 60).toString().padStart(2, "0");
    const secs = (total % 60).toString().padStart(2, "0");
    return `${minutes}:${secs}`;
  }

  function focusInputSoon() {
    window.setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  }

  function changeInputMode(mode: InputMode) {
    if (mode !== inputMode) {
      playSwitchSound();
    }

    setInputMode(mode);
    segmentStartRef.current = answer.length;
    focusInputSoon();
  }

  function cycleInputMode() {
    playSwitchSound();
    setInputMode((old) => nextInputMode(old));
    segmentStartRef.current = answer.length;
    focusInputSoon();
  }

  function updateAnswer(nextValue: string) {
    setAnswer((oldValue) => {
      if (inputMode === "english") {
        return nextValue;
      }

      if (nextValue.length < segmentStartRef.current) {
        segmentStartRef.current = nextValue.length;
        return nextValue;
      }

      if (nextValue.length < oldValue.length) {
        return nextValue;
      }

      const prefix = nextValue.slice(0, segmentStartRef.current);
      const activeSegment = nextValue.slice(segmentStartRef.current);
      const convertedSegment = convertDraftKana(activeSegment, inputMode);

      return prefix + convertedSegment;
    });
  }

  function finishCurrentSegment(value: string) {
    if (inputMode === "english") return value;

    const prefix = value.slice(0, segmentStartRef.current);
    const activeSegment = value.slice(segmentStartRef.current);
    const convertedSegment = convertFinalKana(activeSegment, inputMode);

    return prefix + convertedSegment;
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
      segmentStartRef.current = 0;

      if (isLastWord) {
        setFinished(true);
      }
    }, 650);
  }

  function checkAnswer() {
    const finalAnswer = finishCurrentSegment(answer);

    setAnswer(finalAnswer);
    recordAnswer(finalAnswer);
  }

  function skipWord() {
    if (!current || feedback || finished) return;

    playSkipSound();
    setAnswer("");
    segmentStartRef.current = 0;

    setQueue((old) => {
      if (old.length <= 1) return old;

      const [firstWord, ...rest] = old;
      return [...rest, firstWord];
    });

    focusInputSoon();
  }

  function restart() {
    setQueue(shuffle(words));
    setAnswer("");
    setResults([]);
    setFeedback(null);
    setFinished(false);
    setSecondsLeft(words.length * secondsPerWord(wordType));
    segmentStartRef.current = 0;
  }

  if (loading) {
    return (
      <PageShell className="py-4 sm:py-5">
        <Card className="mx-auto max-w-md p-6 text-center text-lg font-black sm:p-8 sm:text-xl">
          Loading...
        </Card>
      </PageShell>
    );
  }

  if (words.length === 0) {
    return (
      <PageShell className="py-4 sm:py-5">
        <Card className="mx-auto max-w-md p-6 text-center sm:p-8">
          <h1 className="text-3xl font-black text-[#173763] sm:text-4xl">
            No words yet
          </h1>
        </Card>
      </PageShell>
    );
  }

  if (finished) {
    return (
      <PageShell className="py-4 sm:py-5">
        <div className="mx-auto max-w-5xl">
          <Link
            href={`/genki/${book}/chapter/${chapter}`}
            className="text-sm font-bold text-[#173763] hover:underline sm:text-base"
          >
            ← Back to Chapter
          </Link>

          <section className="mt-4 text-center sm:mt-5">
            <h1 className="text-4xl font-black text-[#173763] sm:text-5xl lg:text-[52px]">
              Results
            </h1>

            <div className="mx-auto mt-5 grid max-w-2xl grid-cols-2 gap-4 sm:mt-6 sm:gap-5">
              <Card className="p-4 sm:p-5">
                <p className="text-base text-slate-500 sm:text-lg">Score</p>

                <p className="mt-2 text-3xl font-black text-[#173763] sm:text-4xl">
                  {score} / {results.length}
                </p>
              </Card>

              <Card className="p-4 sm:p-5">
                <p className="text-base text-slate-500 sm:text-lg">
                  Time used
                </p>

                <p className="mt-2 text-3xl font-black text-[#173763] sm:text-4xl">
                  {formatTime(timeUsed)}
                </p>
              </Card>
            </div>

            <div className="mt-5 sm:mt-6">
              <ResultTable results={results} />
            </div>

            <div className="mt-5 flex justify-center gap-4 sm:mt-6">
              <Button variant="green" onClick={restart}>
                Restart
              </Button>

              <Link
                href={`/genki/${book}/chapter/${chapter}`}
                className="rounded-xl bg-gradient-to-br from-[#92b2e8] to-[#6d94d2] px-6 py-3 text-base font-black text-white shadow-lg shadow-blue-200/60"
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
      <PageShell className="py-4 sm:py-5">
        <Card className="mx-auto max-w-md p-6 text-center text-lg font-black sm:p-8 sm:text-xl">
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
    <PageShell className="py-3 sm:py-4">
      <div className="mx-auto max-w-4xl">
        <Link
          href={`/genki/${book}/chapter/${chapter}`}
          className="text-sm font-bold text-[#173763] hover:underline sm:text-base"
        >
          ← Back to Chapter
        </Link>

        <section className="mt-3 text-center sm:mt-4">
          <h1 className="text-4xl font-black tracking-wide text-[#173763] sm:text-5xl lg:text-[52px]">
            Chapter {chapter} — {title}
          </h1>

          <p className="mt-1 text-base text-slate-600 sm:text-lg lg:text-xl">
            {wordType === "kanji"
              ? "Type the hiragana reading for the kanji."
              : "Type the Japanese word for the English prompt."}
          </p>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <div className="hidden sm:block">
              <InputModeSwitch
                inputMode={inputMode}
                onChange={changeInputMode}
              />
            </div>

            <div className="rounded-xl bg-white/90 px-4 py-2 text-base font-black text-[#173763] shadow-lg shadow-slate-200/70 sm:px-5 sm:text-lg">
              📖 {progressNumber} / {words.length}
            </div>

            <div className="rounded-xl bg-white/90 px-4 py-2 text-base font-black text-[#173763] shadow-lg shadow-slate-200/70 sm:px-5 sm:text-lg">
              ◷ {formatTime(secondsLeft)}
            </div>

            <Button
              type="button"
              variant="danger"
              className="text-sm sm:text-base"
              onClick={finishWithMissed}
              disabled={Boolean(feedback)}
            >
              End test
            </Button>
          </div>

          <Card
            className={`soft-pop relative mx-auto mt-4 max-w-2xl p-5 transition-all duration-200 sm:mt-5 sm:p-6 ${cardColor}`}
          >
            {feedback ? (
              <div
                className={`absolute -right-3 -top-7 z-20 flex h-12 w-12 items-center justify-center rounded-full text-3xl font-black text-white shadow-xl sm:-right-4 sm:-top-8 sm:h-14 sm:w-14 sm:text-4xl ${
                  feedback === "right"
                    ? "bg-green-500 shadow-green-300/70"
                    : "bg-rose-500 shadow-rose-300/70"
                }`}
              >
                {feedback === "right" ? "✓" : "×"}
              </div>
            ) : null}

            <h2 className="break-words px-4 text-3xl font-black tracking-wide text-[#173763] sm:px-8 sm:text-4xl lg:text-[46px]">
              {promptText(current, wordType)}
            </h2>

            <Input
              ref={inputRef}
              value={answer}
              disabled={Boolean(feedback)}
              onChange={(event) => updateAnswer(event.target.value)}
              onKeyDown={(event) => {
  if (event.nativeEvent.isComposing) return;

  if (event.key === "Shift" && !event.repeat) {
    shiftWasAloneRef.current = true;
    return;
  }

  if (event.shiftKey && event.key.length === 1) {
    shiftWasAloneRef.current = false;
  }

  if (event.key === "Control" && !event.repeat) {
    event.preventDefault();
    skipWord();
    return;
  }

  if (event.key === "Enter") {
    event.preventDefault();
    checkAnswer();
  }
}}
onKeyUp={(event) => {
  if (event.key === "Shift" && shiftWasAloneRef.current) {
    event.preventDefault();
    shiftWasAloneRef.current = false;
    cycleInputMode();
  }
}}
              className="mt-5 text-lg sm:text-xl"
              placeholder={
                inputMode === "english"
                  ? "Type normally..."
                  : "Type in romaji..."
              }
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
            />

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-5">
              <Button
                type="button"
                variant="green"
                className="text-base sm:text-lg"
                onClick={checkAnswer}
                disabled={Boolean(feedback)}
              >
                Check
              </Button>

              <Button
                type="button"
                variant="blue"
                className="text-base sm:text-lg"
                onClick={skipWord}
                disabled={Boolean(feedback)}
              >
                Skip
              </Button>
            </div>
          </Card>

          <div className="mt-4 flex justify-center sm:hidden">
            <InputModeSwitch inputMode={inputMode} onChange={changeInputMode} />
          </div>
        </section>
      </div>
    </PageShell>
  );
}