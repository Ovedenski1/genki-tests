import { TypingTest } from "@/components/TypingTest";
import type { KanjiMode } from "@/types/genki";

type PageProps = {
  params: Promise<{ book: string; chapter: string }>;
  searchParams: Promise<{ mode?: string; title?: string }>;
};

function cleanMode(mode?: string): KanjiMode {
  if (mode === "vocab" || mode === "back") return mode;
  return "all";
}

function databaseChapterFor(book: number, routeChapter: number) {
  if (book === 2 && routeChapter >= 13) {
    return routeChapter - 12;
  }

  return routeChapter;
}

export default async function KanjiPage({ params, searchParams }: PageProps) {
  const { book, chapter } = await params;
  const { mode, title } = await searchParams;

  const bookNumber = Number(book);
  const routeChapter = Number(chapter);
  const databaseChapter = databaseChapterFor(bookNumber, routeChapter);

  const kanjiMode = cleanMode(mode);

  const defaultTitle =
    databaseChapter === -1
      ? "Katakana"
      : databaseChapter === 0
        ? "Numbers"
        : kanjiMode === "vocab"
          ? "Kanji Vocab"
          : kanjiMode === "back"
            ? "Kanji Back"
            : "Kanji";

  return (
    <TypingTest
      book={bookNumber}
      chapter={databaseChapter}
      routeChapter={routeChapter}
      wordType="kanji"
      kanjiMode={kanjiMode}
      title={title || defaultTitle}
    />
  );
}