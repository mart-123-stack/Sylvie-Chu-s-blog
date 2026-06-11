import type { Metadata } from "next";
import VisitorMap from "@/components/VisitorMap";
import AnimatedSection from "@/components/AnimatedSection";
import SiteFooter from "@/components/SiteFooter";

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "Visitors",
  description: "See where my visitors come from around the world",
};

export default function VisitorsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-blue-950">

      <main className="max-w-5xl mx-auto px-4 py-12">
        <AnimatedSection animation="fade-in-up">
          <div className="mb-8">
            <h2 className="text-5xl font-bold leading-tight tracking-tight text-sky-900 dark:text-white mb-2">Visitor Map</h2>
            <p className="text-foreground/60">
              A live glimpse of readers around the world. Each dot represents a visit.
            </p>
          </div>
        </AnimatedSection>

        <AnimatedSection animation="fade-in-up" delay={100}>
          <VisitorMap />
        </AnimatedSection>

        <AnimatedSection animation="fade-in-up" delay={200}>
          <div className="mt-8 glass-card rounded-xl p-6 text-sm text-foreground/50">
            <p>
              🌐 IP geolocation data is approximate. Only country and city are stored — no personally identifiable information.
              Bot traffic is filtered out. Stats update in real time.
            </p>
          </div>
        </AnimatedSection>
      </main>

      <SiteFooter />
    </div>
  );
}
