import { ArrowRightIcon } from 'lucide-react';
import { Link } from 'react-router';
import { InteractiveBackground } from '@/components/interactive-background';
import { Button } from '@/components/ui/button';

export function LandingPage() {
  return (
    <div className="relative isolate flex min-h-dvh flex-col overflow-hidden">
      <InteractiveBackground className="-z-10" />
      <header className="mx-auto w-full max-w-6xl px-6 py-6">
        <span className="text-heading">MoveMate</span>
      </header>
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center px-6 pb-24">
        <div className="max-w-xl motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-3 motion-safe:duration-700">
          <h1 className="text-display text-balance">Move in with proof.</h1>
          <p className="mt-6 max-w-md text-lg text-pretty text-muted-foreground">
            Photograph every room, confirm what changed since the listing, and give your landlord a dated report.
          </p>
          <Button asChild size="xl" className="mt-10">
            <Link to="/move">
              Start my move
              <ArrowRightIcon data-icon="inline-end" />
            </Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
