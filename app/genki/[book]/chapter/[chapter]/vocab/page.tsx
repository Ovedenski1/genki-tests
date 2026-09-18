import { TypingTest } from "@/components/TypingTest";

type PageProps = {
  params: Promise<{ book: string; chapter: string }>;
  searchParams: Promise<{ list?: string; title?: string; scope?: string }>;
};

function databaseChapterFor(book: number, routeChapter: number) {
  if (book === 2 && routeChapter >= 13) {
    return routeChapter - 12;
  }

  return routeChapter;
}

export default async function VocabPage({ params, searchParams }: PageProps) {
  const { book, chapter } = await params;
  const { list, title, scope } = await searchParams;

  const bookNumber = Number(book);
  const routeChapter = Number(chapter);
  const databaseChapter = databaseChapterFor(bookNumber, routeChapter);

  const includeExtraVocab = scope === "all";

  const defaultTitle =
    databaseChapter === -1
      ? "Hiragana"
      : databaseChapter === 0
        ? "Phrases"
        : includeExtraVocab
          ? "All Vocab"
          : "Vocab";

  return (
    <TypingTest
      book={bookNumber}
      chapter={databaseChapter}
      routeChapter={routeChapter}
      wordType="vocab"
      studyListId={includeExtraVocab ? null : list || null}
      includeExtraVocab={includeExtraVocab}
      title={title || defaultTitle}
    />
  );
}