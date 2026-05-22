import Link from "next/link";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/90 shadow-md shadow-slate-200/40 backdrop-blur-xl">
      <nav className="mx-auto flex min-h-[58px] max-w-7xl items-center justify-between gap-3 px-4 py-2 sm:min-h-[68px] sm:px-6">
        <Link href="/" className="flex min-w-0 items-center">
          <img
            src="/logo.png"
            alt="Pokotoba"
            className="h-9 w-auto object-contain sm:h-11 lg:h-12"
          />
        </Link>

        <div className="hidden items-center gap-8 md:flex lg:gap-12">
          <Link
            href="/about"
            className="text-base text-black hover:text-[#173763] lg:text-lg"
          >
            About
          </Link>

          <Link
            href="/contact"
            className="text-base text-black hover:text-[#173763] lg:text-lg"
          >
            Contact
          </Link>
        </div>

        <a
          href="https://www.buymeacoffee.com/"
          target="_blank"
          rel="noreferrer"
          className="relative flex h-10 shrink-0 items-center gap-2 overflow-hidden rounded-lg bg-gradient-to-br from-[#fff0b8] via-[#ffdc82] to-[#cdeaa6] px-3 text-sm text-black shadow-md shadow-yellow-200/60 transition hover:-translate-y-0.5 hover:brightness-105 sm:h-11 sm:px-4 sm:text-base lg:px-5"
        >
          <span className="matcha-button-shine pointer-events-none absolute top-0 z-0 h-full w-14 -skew-x-12 bg-gradient-to-r from-transparent via-white/90 to-transparent" />

          <img
            src="/matcha-drink.gif"
            alt=""
            className="relative z-10 h-8 w-8 shrink-0 object-contain mix-blend-multiply sm:h-9 sm:w-9"
          />

          <span className="relative z-10 hidden whitespace-nowrap sm:inline">
            Buy Me a Matcha
          </span>

          <span className="relative z-10 sm:hidden">Matcha</span>
        </a>
      </nav>

      <div className="flex justify-center gap-8 border-t border-slate-100 bg-white/70 py-2 md:hidden">
        <Link href="/about" className="text-sm font-semibold text-black">
          About
        </Link>

        <Link href="/contact" className="text-sm font-semibold text-black">
          Contact
        </Link>
      </div>
    </header>
  );
}