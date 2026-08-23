import { SectionEyebrow } from "./SectionEyebrow";
import { SplineSceneBasic } from "./SplineSceneDemo";
import { Bot, Cpu } from "lucide-react";

export function SectionUnderstand() {
  return (
    <section className="relative py-24 lg:py-36">
      <div className="mx-auto grid max-w-[90rem] grid-cols-1 items-center gap-12 px-6 lg:grid-cols-2 lg:gap-16">
        <div>
          <SectionEyebrow>Interactive Code Intelligence</SectionEyebrow>
          <h2 className="font-display text-4xl leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl">
            Meet your{" "}
            <span className="text-gradient">AI Software Architect.</span>
          </h2>
          <p className="mt-6 max-w-lg text-base leading-relaxed text-white/65 sm:text-lg">
            Nebula Agent acts as your 24/7 technical co-pilot inside your repository. Converse directly with an intelligent companion that indexes your codebase, maps complex software dependencies, and guides your engineering decisions in real time.
          </p>

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 max-w-lg">
            <div className="flex items-start gap-3 rounded-2xl border border-white/8 bg-white/[0.03] p-3.5 backdrop-blur">
              <Bot className="h-5 w-5 text-[#3E85E0] shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-semibold text-white">Interactive Architecture</h4>
                <p className="text-[11px] text-white/50 mt-0.5 leading-snug">Ask questions and explore system design in an interactive 3D space.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-2xl border border-white/8 bg-white/[0.03] p-3.5 backdrop-blur">
              <Cpu className="h-5 w-5 text-[#3E85E0] shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-semibold text-white">Grounded Code Graph</h4>
                <p className="text-[11px] text-white/50 mt-0.5 leading-snug">Every answer is cited directly from real repository files and commits.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative h-[480px] sm:h-[540px] w-full overflow-hidden rounded-3xl border border-white/10 bg-[#07090E]/90 backdrop-blur-2xl shadow-[0_16px_48px_rgba(0,0,0,0.6)]">
          <SplineSceneBasic />
        </div>
      </div>
    </section>
  );
}
