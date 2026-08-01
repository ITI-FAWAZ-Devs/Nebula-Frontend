import { SectionEyebrow } from "./SectionEyebrow";
import { ZoomIllustration } from "./ZoomIllustration";

export function SectionUnderstand() {
  return (
    <section className="relative py-40">
      <div className="mx-auto grid max-w-[90rem] grid-cols-1 items-center gap-16 px-6 lg:grid-cols-2">
        <div>
          <SectionEyebrow>Understand your software</SectionEyebrow>
          <h2 className="font-display text-5xl leading-[1.05] tracking-tight text-white sm:text-6xl">
            Understand your{" "}
            <span className="text-gradient">entire software</span> at a glance.
          </h2>
          <p className="mt-6 max-w-lg text-lg leading-relaxed text-white/60">
            Nebula maps every module, service, and dependency of your
            repository into a living galaxy. Zoom from constellations to a
            single function without losing context.
          </p>
        </div>
        <ZoomIllustration />
      </div>
    </section>
  );
}
