import { TypingTest } from "@/components/TypingTest";

type PageProps = {
  params: Promise<{ book: string; chapter: string }>;
};

export default async function VocabPage({ params }: PageProps) {
  const { book, chapter } = await params;

  return (
    <TypingTest
      book={Number(book)}
      chapter={Number(chapter)}
      wordType="vocab"
      title="Vocab"
    />
  );
}