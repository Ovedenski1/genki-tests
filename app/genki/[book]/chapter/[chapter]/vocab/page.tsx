import { TypingTest } from "@/components/TypingTest";

type PageProps = {
  params: Promise<{ book: string; chapter: string }>;
  searchParams: Promise<{ list?: string; title?: string; scope?: string }>;
};

export default async function VocabPage({ params, searchParams }: PageProps) {
  const { book, chapter } = await params;
  const { list, title, scope } = await searchParams;

  const includeExtraVocab = scope === "all";

  return (
    <TypingTest
      book={Number(book)}
      chapter={Number(chapter)}
      wordType="vocab"
      studyListId={includeExtraVocab ? null : list || null}
      includeExtraVocab={includeExtraVocab}
      title={title || (includeExtraVocab ? "All Vocab" : "Vocab")}
    />
  );
}