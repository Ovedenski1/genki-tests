import { PageShell } from "@/components/ui/PageShell";

export default function AboutPage() {
  return (
    <PageShell className="overflow-hidden py-0">
      <section className="mx-auto grid h-[calc(100svh-122px)] max-w-5xl items-center gap-4 lg:grid-cols-[0.88fr_1fr] lg:gap-8">
        <div className="self-center">
          <h1 className="about-title-in text-4xl font-black leading-tight tracking-wide text-[#173763] drop-shadow-sm sm:text-5xl lg:text-[48px]">
            About
            <br />
            Pokotoba
          </h1>

          <div className="about-text-in mt-4 max-w-xl space-y-2.5 text-sm leading-relaxed text-slate-700 sm:text-base">
            <p>
              Pokotoba is a simple study helper I built for myself while trying
              to remember Japanese vocabulary, and I hope it can help you too.
            </p>

            <p>
              I took inspiration from other tools that were very close to what I
              wanted. Some had great practice features but not the words I
              needed, and others had the words but not the exercises I wanted.
              A little picky, I know.
            </p>
          </div>

          <ul className="mt-4 max-w-xl space-y-3.5 text-left">
            <li className="about-bullet-1 flex items-center gap-3.5">
              <img
                src="/free.gif"
                alt=""
                className="h-12 w-12 shrink-0 object-contain sm:h-14 sm:w-14"
              />

              <div>
                <h2 className="text-xl font-black text-[#173763] sm:text-[22px]">
                  Completely free
                </h2>

                <p className="mt-0.5 text-sm leading-relaxed text-slate-600 sm:text-base">
                  I made this tool for myself and didn’t charge myself for it,
                  so I won’t charge you either.
                </p>
              </div>
            </li>

            <li className="about-bullet-2 flex items-center gap-3.5">
              <img
                src="/wrong.png"
                alt=""
                className="h-12 w-12 shrink-0 object-contain sm:h-14 sm:w-14"
              />

              <div>
                <h2 className="text-xl font-black text-[#173763] sm:text-[22px]">
                  Independent fan project
                </h2>

                <p className="mt-0.5 text-sm leading-relaxed text-slate-600 sm:text-base">
                  I have no connection to the Genki textbooks, their authors, or
                  their publisher. Pokotoba is just a personal study tool I made
                  for practice.
                </p>
              </div>
            </li>
          </ul>
        </div>

        <div className="about-character-in relative hidden h-full items-end justify-center overflow-visible lg:flex">
          <p className="about-float absolute left-10 top-14 rotate-[-16deg] text-2xl font-black text-[#9bcc99]/45">
            べんきょう
          </p>

          <p className="about-float about-float-delay absolute right-16 top-8 rotate-[12deg] text-3xl font-black text-[#9bcc99]/40">
            すごい
          </p>

          <p className="about-float absolute bottom-16 right-4 rotate-[-8deg] text-2xl font-black text-[#9bcc99]/45">
            がんばって
          </p>

          <img
            src="/Pokochan.png"
            alt="Pokotoba helper character"
            className="about-character translate-y-4 max-h-[calc(100svh-170px)] w-full object-contain object-bottom drop-shadow-2xl"
          />
        </div>

        <div className="about-character-in relative mx-auto flex max-h-[230px] justify-center overflow-hidden lg:hidden">
          <img
            src="/Pokochan.png"
            alt="Pokotoba helper character"
            className="about-character translate-y-8 max-h-[280px] w-full object-contain object-bottom drop-shadow-2xl"
          />
        </div>
      </section>
    </PageShell>
  );
}