"use client";

import { useMemo, useState } from "react";
import { bestJapaneseAnswer } from "@/lib/normalizeAnswer";
import type { GenkiTerm, KanjiMode, QuizQuestionModel } from "@/types/genki";
import { shuffle, takeRandom } from "@/utils/shuffle";

function getEnglishChoices(term: GenkiTerm, allTerms: GenkiTerm[]) {
  const distractors = term.distractors || [];
  const others = allTerms.map((item) => item.english).filter((item) => item !== term.english);
  return shuffle([term.english, ...takeRandom([...distractors, ...others], 3)]).slice(0, 4);
}

function getJapaneseChoices(term: GenkiTerm, allTerms: GenkiTerm[]) {
  const correct = bestJapaneseAnswer(term);
  const others = allTerms.map(bestJapaneseAnswer).filter((item) => item && item !== correct);
  return shuffle([correct, ...takeRandom(others, 3)]).slice(0, 4);
}

export function makeQuizQuestions(terms: GenkiTerm[], mode: "quiz" | KanjiMode = "quiz") {
  return shuffle(terms).map((term, index) => {
    const shouldAskBack = mode === "back" || (mode === "both" && index % 2 === 1);
    if (shouldAskBack) {
      const prompt = term.english || term.reading || "Choose the kanji";
      return {
        id: `${term.id}-back`,
        prompt,
        correctAnswer: bestJapaneseAnswer(term),
        options: getJapaneseChoices(term, terms),
        hint: term.reading ? `Reading: ${term.reading}` : undefined,
        term,
      } satisfies QuizQuestionModel;
    }

    return {
      id: `${term.id}-front`,
      prompt: bestJapaneseAnswer(term),
      correctAnswer: term.english,
      options: getEnglishChoices(term, terms),
      hint: term.reading ? `Reading: ${term.reading}` : undefined,
      term,
    } satisfies QuizQuestionModel;
  });
}

export function useQuiz(terms: GenkiTerm[], mode: "quiz" | KanjiMode = "quiz") {
  const [seed, setSeed] = useState(0);
  const questions = useMemo(() => makeQuizQuestions(terms, mode), [terms, mode, seed]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const currentQuestion = questions[index];

  function selectAnswer(answer: string) {
    if (selected || finished || !currentQuestion) return;
    setSelected(answer);
    if (answer === currentQuestion.correctAnswer) setScore((value) => value + 1);
  }

  function nextQuestion() {
    if (index >= questions.length - 1) {
      setFinished(true);
      return;
    }
    setIndex((value) => value + 1);
    setSelected(null);
  }

  function restart() {
    setSeed((value) => value + 1);
    setIndex(0);
    setSelected(null);
    setScore(0);
    setFinished(false);
  }

  return {
    questions,
    currentQuestion,
    index,
    selected,
    score,
    finished,
    selectAnswer,
    nextQuestion,
    restart,
  };
}