import { HouseIcon } from 'lucide-react';
import { Link } from 'react-router';
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';

export function MoveShellPage() {
  return (
    <div className="min-h-dvh">
      <header className="border-b">
        <div className="mx-auto flex h-14 max-w-5xl items-center px-6">
          <Link to="/" className="text-heading">
            MoveMate
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-6 py-16">
        <Empty className="border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <HouseIcon />
            </EmptyMedia>
            <EmptyTitle>No move yet</EmptyTitle>
            <EmptyDescription>Your move-in steps will show up here.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      </main>
    </div>
  );
}
