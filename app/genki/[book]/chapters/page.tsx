import { ChapterGrid } from "@/components/ChapterGrid";
import { PageShell } from "@/components/ui/PageShell";

type PageProps = {
  params: Promise<{ book: string }>;
};

export default async function ChaptersPage({ params }: PageProps) {
  const { book } = await params;

  return (
    <PageShell className="py-5 sm:py-6 lg:py-7">
      <section className="text-center">
        <h1 className="text-4xl font-black tracking-wide text-[#173763] sm:text-5xl lg:text-[52px]">
          Genki {book}
        </h1>

        <p className="mt-3 text-base text-slate-600 sm:text-lg lg:text-xl">
          Choose a chapter to start learning vocabulary and kanji.
        </p>

        <ChapterGrid book={Number(book)} />
      </section>
    </PageShell>
  );
}