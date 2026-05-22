import { TypingTest } from "@/components/TypingTest";
import type { KanjiMode } from "@/types/genki";

type PageProps = {
  params: Promise<{ book: string; chapter: string }>;
  searchParams: Promise<{ mode?: string }>;
};

function cleanMode(mode?: string): KanjiMode {
  if (mode === "vocab" || mode === "back") return mode;
  return "all";
}

export default async function KanjiPage({ params, searchParams }: PageProps) {
  const { book, chapter } = await params;
  const { mode } = await searchParams;

  const kanjiMode = cleanMode(mode);

  const title =
    kanjiMode === "vocab"
      ? "Kanji Vocab"
      : kanjiMode === "back"
        ? "Kanji Back"
        : "Kanji";

  return (
    <TypingTest
      book={Number(book)}
      chapter={Number(chapter)}
      wordType="kanji"
      kanjiMode={kanjiMode}
      title={title}
    />
  );
}