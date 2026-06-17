import { Reveal } from "@/components/Reveal";
import { SectionHeading } from "./SectionHeading";
import { BASICS } from "./constants";

export function LearnBasics() {
  return (
    <section id="learn" className="border-t border-border bg-card py-20">
      <div className="container">
        <Reveal>
          <SectionHeading eyebrow="Carbon, explained" title="The basics, without the jargon" />
        </Reveal>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {BASICS.map((b, i) => (
            <Reveal key={b.title} delay={i * 0.08}>
              <div className="h-full rounded-lg border border-border bg-background p-7">
                <span className="bg-accent/12 grid size-11 place-items-center rounded-xl text-accent">
                  <b.icon className="size-5" aria-hidden />
                </span>
                <h3 className="mt-5 font-display text-lg font-semibold">{b.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{b.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
