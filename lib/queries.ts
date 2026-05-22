import { createSupabaseBrowserClient } from "@/lib/supabaseClient";
import type {
  GenkiWord,
  GenkiWordInsert,
  GenkiWordUpdate,
  KanjiMode,
  WordType,
} from "@/types/genki";

export async function fetchWords(
  book: number,
  chapter: number,
  wordType: WordType,
  kanjiMode: KanjiMode = "all"
) {
  const supabase = createSupabaseBrowserClient();

  let query = supabase
    .from("genki_words")
    .select("*")
    .eq("book_number", book)
    .eq("chapter_number", chapter)
    .eq("word_type", wordType)
    .order("created_at", { ascending: true });

  if (wordType === "kanji" && kanjiMode !== "all") {
    query = query.eq("kanji_mode", kanjiMode);
  }

  const { data, error } = await query;

  if (error) throw error;

  return (data || []) as GenkiWord[];
}

export async function fetchAdminWords(
  book: number,
  chapter: number,
  wordType: WordType
) {
  const supabase = createSupabaseBrowserClient();

  const { data, error } = await supabase
    .from("genki_words")
    .select("*")
    .eq("book_number", book)
    .eq("chapter_number", chapter)
    .eq("word_type", wordType)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data || []) as GenkiWord[];
}

export async function createWord(word: GenkiWordInsert) {
  const supabase = createSupabaseBrowserClient();

  const { error } = await supabase.from("genki_words").insert(word);

  if (error) throw error;
}

export async function updateWord(id: string, word: GenkiWordUpdate) {
  const supabase = createSupabaseBrowserClient();

  const { error } = await supabase
    .from("genki_words")
    .update(word)
    .eq("id", id);

  if (error) throw error;
}

export async function deleteWord(id: string) {
  const supabase = createSupabaseBrowserClient();

  const { error } = await supabase
    .from("genki_words")
    .delete()
    .eq("id", id);

  if (error) throw error;
}