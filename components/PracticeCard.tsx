import Link from "next/link";
import { KanjiIcon, OpenBookIcon } from "@/components/StudyIcons";

export function PracticeCard({
  href,
  title,
  description,
  icon,
  color,
}: {
  href: string;
  title: string;
  description: string;
  icon: "book" | "kanji";
  color: "green" | "blue";
}) {
  const styles =
    color === "green"
      ? "bg-gradient-to-br from-[#9bcc99] to-[#78b978] shadow-green-300/50"
      : "bg-gradient-to-br from-[#92b2e8] to-[#6d94d2] shadow-blue-300/50";

  return (
    <Link
      href={href}
      className={`flex h-[220px] w-full flex-col items-center justify-center rounded-xl px-4 text-center text-white shadow-xl transition hover:-translate-y-1 hover:brightness-105 sm:h-[250px] lg:h-[285px] ${styles}`}
    >
      {icon === "book" ? (
        <OpenBookIcon className="home-book-float mx-auto h-12 w-12 text-white drop-shadow sm:h-14 sm:w-14 lg:h-16 lg:w-16" />
      ) : (
        <div className="home-book-float mx-auto flex h-12 w-12 items-center justify-center rounded-xl border-4 border-white text-white sm:h-14 sm:w-14 lg:h-16 lg:w-16">
          <KanjiIcon className="text-4xl font-black leading-none sm:text-5xl" />
        </div>
      )}

      <h2 className="mt-5 text-3xl font-black sm:mt-6 sm:text-4xl">
        {title}
      </h2>

      <p className="mt-4 hidden max-w-[230px] text-base leading-snug text-white/90 sm:block lg:mt-6 lg:text-lg">
        {description}
      </p>
    </Link>
  );
}