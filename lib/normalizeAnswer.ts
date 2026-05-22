import type { GenkiWord, WordType } from "@/types/genki";

export function normalizeAnswer(value: string | null | undefined) {
  return (value || "")
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[\s　]/g, "")
    .trim();
}

function splitAnswers(value: string | null | undefined) {
  if (!value) return [];

  return value
    .split(/[;|、／/]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function formatAnswers(value: string | null | undefined) {
  return splitAnswers(value).join(" / ");
}

export function promptText(word: GenkiWord, type: WordType) {
  if (type === "kanji") {
    return word.kanji || word.english || "";
  }

  return word.english;
}

export function mainAnswer(word: GenkiWord, type: WordType): string {
  if (type === "kanji") {
    return formatAnswers(word.japanese || word.hiragana || "");
  }

  return formatAnswers(word.japanese || "");
}

export function resultReading(word: GenkiWord, type: WordType): string {
  if (type === "kanji") {
    return word.reading || "";
  }

  return "";
}

export function acceptedAnswers(word: GenkiWord, type: WordType) {
  if (type === "kanji") {
    return [...splitAnswers(word.japanese), ...splitAnswers(word.hiragana)];
  }

  return splitAnswers(word.japanese);
}

export function isCorrectAnswer(answer: string, word: GenkiWord, type: WordType) {
  const normalized = normalizeAnswer(answer);

  return acceptedAnswers(word, type).some(
    (correct) => normalizeAnswer(correct) === normalized
  );
}