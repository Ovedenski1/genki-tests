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
      className={`flex h-full w-full flex-col items-center justify-center rounded-xl px-4 py-10 text-center text-white shadow-xl transition hover:-translate-y-1 hover:brightness-105 sm:px-10 sm:py-14 lg:px-16 lg:py-16 ${styles}`}
    >
      {icon === "book" ? (
        <OpenBookIcon className="mx-auto h-12 w-12 text-white drop-shadow sm:h-16 sm:w-16 lg:h-20 lg:w-20" />
      ) : (
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border-4 border-white text-white sm:h-16 sm:w-16 lg:h-20 lg:w-20">
          <KanjiIcon className="text-4xl font-black leading-none sm:text-5xl lg:text-6xl" />
        </div>
      )}

      <h2 className="mt-5 text-3xl font-black sm:mt-8 sm:text-4xl lg:text-5xl">
        {title}
      </h2>

      <p className="mt-4 hidden text-lg text-white/90 sm:block lg:mt-8 lg:text-xl">
        {description}
      </p>
    </Link>
  );
}