import { Reveal } from "@/components/Reveal";
import { Card } from "@/components/ui/card";
import { LEARN_FACTS } from "@/lib/countryData";
import { SectionHeading } from "./SectionHeading";

export function WhyItMatters() {
  return (
    <section id="why" className="container py-20">
      <Reveal>
        <SectionHeading eyebrow="Why it matters" title="A small number with a big story" />
      </Reveal>
      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {LEARN_FACTS.map((f, i) => (
          <Reveal key={f.label} delay={i * 0.08}>
            <Card className="h-full p-7">
              <p className="text-gradient tabular font-display text-4xl font-semibold">{f.stat}</p>
              <p className="mt-3 font-medium">{f.label}</p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.note}</p>
            </Card>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
