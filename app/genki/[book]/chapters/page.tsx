import { ChapterGrid } from "@/components/ChapterGrid";

type PageProps = {
  params: Promise<{ book: string }>;
};

export default async function ChaptersPage({ params }: PageProps) {
  const { book } = await params;

  return (
    <main>
      <section className="px-4 py-10 text-center sm:px-6 sm:py-14 lg:py-20">
        <h1 className="text-5xl font-black tracking-wide text-[#173763] sm:text-6xl lg:text-7xl">
          Genki {book}
        </h1>

        <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-xl lg:text-2xl">
          Choose a chapter to start learning vocabulary and kanji.
        </p>

        <ChapterGrid book={Number(book)} />
      </section>
    </main>
  );
}