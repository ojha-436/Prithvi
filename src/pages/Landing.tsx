import { PublicNav } from "@/components/layout/PublicNav";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/landing/Hero";
import { WhyItMatters } from "@/components/landing/WhyItMatters";
import { ComparisonSection } from "@/components/landing/ComparisonSection";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { LearnBasics } from "@/components/landing/LearnBasics";
import { FinalCTA } from "@/components/landing/FinalCTA";

/** Public landing + education page — composed from focused section components. */
export default function Landing() {
  return (
    <div className="bg-paper">
      <PublicNav />
      <main id="main">
        <Hero />
        <WhyItMatters />
        <ComparisonSection />
        <HowItWorks />
        <LearnBasics />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}
