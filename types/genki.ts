import type { Database } from "@/types/database";

export type WordType = "vocab" | "kanji";
export type KanjiMode = "vocab" | "back" | "all";

export type AdminEntryType = "vocab" | "extra" | "kanji";

export type GenkiWord = Database["public"]["Tables"]["genki_words"]["Row"] & {
  study_list_id?: string | null;
};

export type GenkiWordInsert =
  Database["public"]["Tables"]["genki_words"]["Insert"] & {
    study_list_id?: string | null;
  };

export type GenkiWordUpdate =
  Database["public"]["Tables"]["genki_words"]["Update"] & {
    study_list_id?: string | null;
  };

export type StudyList = {
  id: string;
  book_number: number;
  chapter_number: number;
  name: string;
  slug: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type StudyListInsert = {
  book_number: number;
  chapter_number: number;
  name: string;
  slug: string;
  sort_order?: number;
};

export type AdminWordSearchResult = {
  word: GenkiWord;
  studyList: StudyList | null;
};

export type TypingResult = {
  prompt: string;
  expected: string;
  userAnswer: string;
  reading: string;
  correct: boolean;
};