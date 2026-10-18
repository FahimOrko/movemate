import { ArrowRightIcon } from "lucide-react";
import { Link } from "react-router";
import { InteractiveBackground } from "@/components/interactive-background";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";

const COPY = {
  headline: "Your move in, documented",
  subheading:
    "Document every problem, send your landlord a clear report, and help protect your deposit. Then get your new home set up.",
  cta: "Start my move-in report",
  note: "No sign-up needed.",
};

// Keeps "move-in," on one line so the hyphen is never a break point.
const [HEADLINE_LEAD = "", HEADLINE_REST = ""] = COPY.headline.split(", ");

export function LandingPage() {
  return (
    <div className="relative isolate flex min-h-dvh flex-col overflow-hidden">
      <InteractiveBackground className="-z-10" />
      <header className="mx-auto w-full max-w-6xl px-6 py-6">
        <Logo size={32} />
      </header>
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center px-6 pb-24">
        <div className="max-w-xl motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-3 motion-safe:duration-700">
          <h1 className="text-display text-balance">
            <span className="whitespace-nowrap">{HEADLINE_LEAD},</span>{" "}
            {HEADLINE_REST}
          </h1>
          <p className="mt-6 max-w-xl text-lg text-pretty text-muted-foreground">
            {COPY.subheading}
          </p>
          <Button asChild size="xl" className="mt-10">
            <Link to="/move">
              {COPY.cta}
              <ArrowRightIcon data-icon="inline-end" />
            </Link>
          </Button>
          <p className="mt-4 text-sm text-muted-foreground">{COPY.note}</p>
        </div>
      </main>
    </div>
  );
}
