import { createSupabaseBrowserClient } from "@/lib/supabaseClient";
import type {
  AdminWordSearchResult,
  GenkiWord,
  GenkiWordInsert,
  GenkiWordUpdate,
  KanjiMode,
  StudyList,
  StudyListInsert,
  WordType,
} from "@/types/genki";

function makeSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9\u3040-\u30ff\u3400-\u9fff]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function cleanSearchValue(value: string) {
  return value
    .trim()
    .replace(/[%,()]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export async function fetchStudyLists(book: number, chapter: number) {
  const supabase = createSupabaseBrowserClient();

  const { data, error } = await supabase
    .from("study_lists" as never)
    .select("*")
    .eq("book_number", book)
    .eq("chapter_number", chapter)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) throw error;

  return (data || []) as unknown as StudyList[];
}

export async function createStudyList({
  book_number,
  chapter_number,
  name,
  sort_order = 0,
}: {
  book_number: number;
  chapter_number: number;
  name: string;
  sort_order?: number;
}) {
  const supabase = createSupabaseBrowserClient();

  const cleanName = name.trim();

  const payload: StudyListInsert = {
    book_number,
    chapter_number,
    name: cleanName,
    slug: makeSlug(cleanName),
    sort_order,
  };

  const { data, error } = await supabase
    .from("study_lists" as never)
    .insert(payload as never)
    .select("*")
    .single();

  if (error) throw error;

  return data as unknown as StudyList;
}

export async function searchAdminWords(value: string) {
  const supabase = createSupabaseBrowserClient();

  const search = cleanSearchValue(value);

  if (!search) {
    return [] as AdminWordSearchResult[];
  }

  const pattern = `%${search}%`;

  const { data, error } = await supabase
    .from("genki_words")
    .select("*")
    .or(
      [
        `english.ilike.${pattern}`,
        `japanese.ilike.${pattern}`,
        `hiragana.ilike.${pattern}`,
        `katakana.ilike.${pattern}`,
        `kanji.ilike.${pattern}`,
        `reading.ilike.${pattern}`,
        `notes.ilike.${pattern}`,
      ].join(",")
    )
    .order("book_number", { ascending: true })
    .order("chapter_number", { ascending: true })
    .order("word_type", { ascending: true })
    .limit(80);

  if (error) throw error;

  const words = (data || []) as GenkiWord[];

  const studyListIds = Array.from(
    new Set(
      words
        .map((word) => word.study_list_id)
        .filter((id): id is string => Boolean(id))
    )
  );

  let studyLists: StudyList[] = [];

  if (studyListIds.length > 0) {
    const { data: listData, error: listError } = await supabase
      .from("study_lists" as never)
      .select("*")
      .in("id" as never, studyListIds as never);

    if (listError) throw listError;

    studyLists = (listData || []) as unknown as StudyList[];
  }

  const studyListMap = new Map(studyLists.map((list) => [list.id, list]));

  return words.map((word) => ({
    word,
    studyList: word.study_list_id
      ? studyListMap.get(word.study_list_id) || null
      : null,
  })) as AdminWordSearchResult[];
}

export async function fetchWords(
  book: number,
  chapter: number,
  wordType: WordType,
  kanjiMode: KanjiMode = "all",
  studyListId: string | null = null,
  includeExtraVocab = false
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

  if (wordType === "vocab" && !includeExtraVocab) {
    if (studyListId) {
      query = query.eq("study_list_id" as never, studyListId as never);
    } else {
      query = query.is("study_list_id" as never, null);
    }
  }

  const { data, error } = await query;

  if (error) throw error;

  return (data || []) as GenkiWord[];
}

export async function fetchAdminWords(
  book: number,
  chapter: number,
  wordType: WordType,
  kanjiMode: KanjiMode = "all",
  studyListId: string | null = null
) {
  const supabase = createSupabaseBrowserClient();

  let query = supabase
    .from("genki_words")
    .select("*")
    .eq("book_number", book)
    .eq("chapter_number", chapter)
    .eq("word_type", wordType)
    .order("created_at", { ascending: false });

  if (wordType === "kanji" && kanjiMode !== "all") {
    query = query.eq("kanji_mode", kanjiMode);
  }

  if (wordType === "vocab") {
    if (studyListId) {
      query = query.eq("study_list_id" as never, studyListId as never);
    } else {
      query = query.is("study_list_id" as never, null);
    }
  }

  const { data, error } = await query;

  if (error) throw error;

  return (data || []) as GenkiWord[];
}

export async function createWord(word: GenkiWordInsert) {
  const supabase = createSupabaseBrowserClient();

  const { error } = await supabase.from("genki_words").insert(word as never);

  if (error) throw error;
}

export async function updateWord(id: string, word: GenkiWordUpdate) {
  const supabase = createSupabaseBrowserClient();

  const { error } = await supabase
    .from("genki_words")
    .update(word as never)
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