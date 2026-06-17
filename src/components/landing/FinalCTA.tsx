import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/Reveal";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function FinalCTA() {
  return (
    <section className="container py-20">
      <Reveal>
        <Card className="relative overflow-hidden bg-primary p-10 text-center text-primary-foreground sm:p-16">
          <div
            className="bg-contour absolute inset-0 opacity-40 mix-blend-soft-light"
            aria-hidden
          />
          <div className="relative mx-auto max-w-xl">
            <h2 className="font-display text-3xl font-semibold sm:text-4xl">
              Your first tonne saved starts today
            </h2>
            <p className="mt-3 text-primary-foreground/80">
              Join Prithvi, find out where you stand, and get a clear plan to do better.
            </p>
            <div className="mt-8 flex justify-center">
              <Link to="/signup">
                <Button size="lg" variant="accent">
                  Create my free account <ArrowRight className="size-4" />
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </Reveal>
    </section>
  );
}
