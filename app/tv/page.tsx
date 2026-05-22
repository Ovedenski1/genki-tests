import { PageShell } from "@/components/ui/PageShell";

export default function TvPage() {
  return (
    <PageShell className="overflow-hidden py-8 sm:py-10 lg:py-12">
      <section className="mx-auto flex max-w-6xl flex-col items-center text-center 2xl:max-w-[1500px]">
        <h1 className="text-4xl font-black tracking-wide text-[#173763] drop-shadow-sm sm:text-5xl lg:text-6xl 2xl:text-7xl">
          Pokotoba TV
        </h1>

        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-slate-600 sm:text-2xl">
          Testing videos inside the Pokotoba TV frame.
        </p>

        <div className="mt-8 w-full max-w-5xl sm:mt-10 2xl:max-w-6xl">
          <div className="relative mx-auto w-full">
            {/* Video behind the transparent TV frame */}
            <video
              className="absolute left-[4%] right-[3%] top-[5%] z-0 h-[84.5%] w-[93%] rounded-[1.5vw] bg-black object-cover"
              src="/video.mp4"
              controls
              autoPlay
              muted
              loop
              playsInline
            />

            {/* Transparent TV frame above the video */}
            <img
              src="/tv.png"
              alt="Pokotoba TV frame"
              className="relative z-10 w-full select-none object-contain drop-shadow-2xl"
              draggable={false}
            />
          </div>
        </div>
      </section>
    </PageShell>
  );
}