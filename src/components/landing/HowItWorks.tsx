import { Reveal } from "@/components/Reveal";
import { Card } from "@/components/ui/card";
import { SectionHeading } from "./SectionHeading";
import { STEPS } from "./constants";

export function HowItWorks() {
  return (
    <section id="how" className="container py-20">
      <Reveal>
        <SectionHeading
          eyebrow="How it works"
          title="From curiosity to climate action in three steps"
        />
      </Reveal>
      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {STEPS.map((s, i) => (
          <Reveal key={s.title} delay={i * 0.08}>
            <Card className="relative h-full p-7">
              <span className="tabular absolute right-6 top-6 font-display text-5xl font-semibold text-muted/60">
                0{i + 1}
              </span>
              <span className="grid size-12 place-items-center rounded-xl bg-primary/10 text-primary">
                <s.icon className="size-6" aria-hidden />
              </span>
              <h3 className="mt-5 font-display text-xl font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
            </Card>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
