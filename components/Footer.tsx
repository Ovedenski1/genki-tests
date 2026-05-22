export function Footer() {
  return (
    <footer className="relative mt-auto border-t border-slate-100 bg-[#f7f0e7]/95 px-4 py-5 text-[#173763] sm:py-6 2xl:py-8">
      <p className="text-center text-sm tracking-widest sm:text-base 2xl:text-lg">
        Pokotoba is an unofficial fan project. It is not affiliated with, endorsed by, or connected to the GENKI textbooks, their authors, or their publisher!
      </p>

      <p className="mt-3 text-center text-[10px] text-slate-500 sm:absolute sm:left-6 sm:top-1/2 sm:mt-0 sm:-translate-y-1/2 sm:text-left sm:text-xs 2xl:left-8">
        © {new Date().getFullYear()} Genki Study Desk
      </p>

      <p className="mt-2 text-center text-[10px] text-slate-500 sm:absolute sm:right-6 sm:top-1/2 sm:mt-0 sm:-translate-y-1/2 sm:text-right sm:text-xs 2xl:right-8">
        Matcha icon by{" "}
        <a
          href="https://www.flaticon.com/free-animated-icons/matcha"
          title="matcha animated icons"
          target="_blank"
          rel="noreferrer"
          className="font-semibold text-[#173763] underline decoration-[#6d94d2]/50 underline-offset-2 hover:text-[#6d94d2]"
        >
          Freepik - Flaticon
        </a>
      </p>
    </footer>
  );
}