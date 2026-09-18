import Link from "next/link";
import { ChapterPracticeMenu } from "@/components/ChapterPracticeMenu";
import { PageShell } from "@/components/ui/PageShell";

type PageProps = {
  params: Promise<{ book: string; chapter: string }>;
};

function databaseChapterFor(book: number, routeChapter: number) {
  if (book === 2 && routeChapter >= 13) {
    return routeChapter - 12;
  }

  return routeChapter;
}

export default async function ChapterPage({ params }: PageProps) {
  const { book, chapter } = await params;

  const bookNumber = Number(book);
  const routeChapter = Number(chapter);
  const databaseChapter = databaseChapterFor(bookNumber, routeChapter);

  const base = `/genki/${book}/chapter/${routeChapter}`;

  const title = databaseChapter === -1 ? "Writing" : `Chapter ${routeChapter}`;

  const subtitle =
    databaseChapter === -1
      ? "Choose what you want to practice."
      : "Choose what you want to study.";

  return (
    <PageShell className="py-5 sm:py-6 lg:py-7">
      <Link
        href={`/genki/${book}/chapters`}
        className="chapter-back-in text-base font-bold text-[#173763] hover:underline"
      >
        ← Back to Chapters
      </Link>

      <section className="mt-5 text-center sm:mt-7 lg:mt-8">
        <h1 className="chapter-title-in text-4xl font-black tracking-wide text-[#173763] sm:text-5xl lg:text-[52px]">
          {title}
        </h1>

        <p className="chapter-subtitle-in mt-3 text-lg text-slate-600 sm:text-xl lg:text-2xl">
          {subtitle}
        </p>

        <ChapterPracticeMenu
          base={base}
          book={bookNumber}
          chapter={databaseChapter}
        />
      </section>
    </PageShell>
  );
}