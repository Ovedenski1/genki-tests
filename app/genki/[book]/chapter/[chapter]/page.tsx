import Link from "next/link";
import { ChapterPracticeMenu } from "@/components/ChapterPracticeMenu";
import { PageShell } from "@/components/ui/PageShell";

type PageProps = {
  params: Promise<{ book: string; chapter: string }>;
};

export default async function ChapterPage({ params }: PageProps) {
  const { book, chapter } = await params;
  const base = `/genki/${book}/chapter/${chapter}`;

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
          Chapter {chapter}
        </h1>

        <p className="chapter-subtitle-in mt-3 text-lg text-slate-600 sm:text-xl lg:text-2xl">
          Choose what you want to study.
        </p>

        <ChapterPracticeMenu
          base={base}
          book={Number(book)}
          chapter={Number(chapter)}
        />
      </section>
    </PageShell>
  );
}