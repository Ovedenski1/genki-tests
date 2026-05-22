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
    <PageShell>
      <Link
        href={`/genki/${book}/chapters`}
        className="chapter-back-in text-base font-bold text-[#173763] hover:underline sm:text-xl"
      >
        ← Back to Chapters
      </Link>

      <section className="mt-8 text-center sm:mt-12 lg:mt-16">
        <h1 className="chapter-title-in text-5xl font-black tracking-wide text-[#173763] sm:text-6xl lg:text-7xl">
          Chapter {chapter}
        </h1>

        <p className="chapter-subtitle-in mt-4 text-xl text-slate-600 sm:text-2xl lg:text-3xl">
          Choose what you want to study.
        </p>

        <ChapterPracticeMenu base={base} />
      </section>
    </PageShell>
  );
}