import { SectionEyebrow } from "./SectionEyebrow";
import { LivingGraphIllustration } from "./LivingGraphIllustration";

export function SectionLivingArch() {
  return (
    <section className="relative py-40">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-16 px-6 lg:grid-cols-2">
        <LivingGraphIllustration />
        <div>
          <SectionEyebrow>Living Architecture</SectionEyebrow>
          <h2 className="font-display text-5xl leading-[1.05] tracking-tight sm:text-6xl">
            Documentation that{" "}
            <span className="text-gradient">breathes</span> with your code.
          </h2>
          <p className="mt-6 max-w-lg text-lg text-white/60">
            Static diagrams go stale in a day. Nebula continuously rebuilds
            your architecture as your team ships — every merge, every rename,
            every new service.
          </p>
        </div>
      </div>
    </section>
  );
}
