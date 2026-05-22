"use client";

import { useEffect, useState } from "react";
import { bestJapaneseAnswer, isCorrectAnswer } from "@/lib/normalizeAnswer";
import type { GenkiTerm, TypingResult } from "@/types/genki";
import { shuffle } from "@/utils/shuffle";

export function useTypingTest(terms: GenkiTerm[]) {
  const [items, setItems] = useState(() => shuffle(terms));
  const [index, setIndex] = useState(0);
  const [input, setInput] = useState("");
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [results, setResults] = useState<TypingResult[]>([]);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    setItems(shuffle(terms));
    setIndex(0);
    setInput("");
    setFeedback(null);
    setResults([]);
    setFinished(false);
  }, [terms]);

  const current = items[index];
  const score = results.filter((result) => result.status === "Correct").length;

  function submitAnswer() {
    if (!current || feedback) return false;
    const correct = isCorrectAnswer(input, current);
    const status = correct ? "Correct" : input.trim() ? "Wrong" : "Missed";
    setFeedback(correct ? "correct" : "wrong");
    setResults((value) => [
      ...value,
      {
        prompt: current.english,
        correctAnswer: bestJapaneseAnswer(current),
        userAnswer: input,
        status,
      },
    ]);
    return true;
  }

  function moveNext() {
    if (index >= items.length - 1) {
      setFinished(true);
      setFeedback(null);
      return;
    }
    setIndex((value) => value + 1);
    setInput("");
    setFeedback(null);
  }

  function restart() {
    setItems(shuffle(terms));
    setIndex(0);
    setInput("");
    setFeedback(null);
    setResults([]);
    setFinished(false);
  }

  return {
    current,
    index,
    total: items.length,
    input,
    setInput,
    feedback,
    results,
    score,
    finished,
    submitAnswer,
    moveNext,
    restart,
  };
}