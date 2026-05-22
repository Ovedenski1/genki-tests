import { PageShell } from "@/components/ui/PageShell";

export default function AboutPage() {
  return (
    <PageShell className="overflow-hidden pt-4 pb-0 sm:pt-6 lg:pt-8">
      <section className="mx-auto grid min-h-[calc(100svh-235px)] max-w-6xl items-end gap-4 lg:grid-cols-[0.95fr_1fr] lg:gap-10 2xl:max-w-[1500px]">
        <div className="self-center pb-4 lg:pb-4">
          <h1 className="about-title-in text-4xl font-black leading-tight tracking-wide text-[#173763] drop-shadow-sm sm:text-5xl lg:text-6xl 2xl:text-7xl">
            About
            <br />
            Pokotoba
          </h1>

          <div className="about-text-in mt-7 max-w-2xl space-y-4 text-base leading-relaxed text-slate-700 sm:text-lg 2xl:text-xl">
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

          <ul className="mt-8 max-w-2xl space-y-6 text-left">
            <li className="about-bullet-1 flex items-center gap-5">
              <img
                src="/free.gif"
                alt=""
                className="h-[72px] w-[72px] shrink-0 object-contain sm:h-20 sm:w-20 2xl:h-24 2xl:w-24"
              />

              <div>
                <h2 className="text-2xl font-black text-[#173763] sm:text-3xl 2xl:text-4xl">
                  Completely free
                </h2>

                <p className="mt-1 text-lg leading-relaxed text-slate-600 sm:text-xl 2xl:text-2xl">
                  I made this tool for myself and didn’t charge myself for it,
                  so I won’t charge you either.
                </p>
              </div>
            </li>

            <li className="about-bullet-2 flex items-center gap-5">
              <img
                src="/wrong.png"
                alt=""
                className="h-[72px] w-[72px] shrink-0 object-contain sm:h-20 sm:w-20 2xl:h-24 2xl:w-24"
              />

              <div>
                <h2 className="text-2xl font-black text-[#173763] sm:text-3xl 2xl:text-4xl">
                  Independent fan project
                </h2>

                <p className="mt-1 text-lg leading-relaxed text-slate-600 sm:text-xl 2xl:text-2xl">
                  I have no connection to the Genki textbooks, their authors, or
                  their publisher. Pokotoba is just a personal study tool I made
                  for practice.
                </p>
              </div>
            </li>
          </ul>
        </div>

        <div className="about-character-in relative hidden h-full min-h-[430px] items-end justify-center overflow-visible lg:flex">
          <p className="about-float absolute left-6 top-20 rotate-[-16deg] text-3xl font-black text-[#9bcc99]/45 2xl:text-5xl">
            べんきょう
          </p>

          <p className="about-float about-float-delay absolute right-12 top-10 rotate-[12deg] text-4xl font-black text-[#9bcc99]/40 2xl:text-6xl">
            すごい
          </p>

          <p className="about-float absolute bottom-20 right-0 rotate-[-8deg] text-3xl font-black text-[#9bcc99]/45 2xl:text-5xl">
            がんばって
          </p>

          <img
            src="/Pokochan.png"
            alt="Pokotoba helper character"
            className="about-character translate-y-10 max-h-[calc(100svh-150px)] min-h-[430px] w-full object-contain object-bottom drop-shadow-2xl 2xl:max-h-[calc(100svh-175px)]"
          />
        </div>

        <div className="about-character-in relative mx-auto flex max-h-[300px] justify-center overflow-hidden lg:hidden">
          <img
            src="/Pokochan.png"
            alt="Pokotoba helper character"
            className="about-character translate-y-8 max-h-[330px] w-full object-contain object-bottom drop-shadow-2xl"
          />
        </div>
      </section>
    </PageShell>
  );
}