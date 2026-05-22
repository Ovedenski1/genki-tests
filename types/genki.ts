import type { Database } from "@/types/database";

export type WordType = "vocab" | "kanji";
export type KanjiMode = "vocab" | "back" | "all";

export type GenkiWord = Database["public"]["Tables"]["genki_words"]["Row"];
export type GenkiWordInsert =
  Database["public"]["Tables"]["genki_words"]["Insert"];
export type GenkiWordUpdate =
  Database["public"]["Tables"]["genki_words"]["Update"];

export type TypingResult = {
  prompt: string;
  expected: string;
  userAnswer: string;
  reading: string;
  correct: boolean;
};