import { CircleAlertIcon } from 'lucide-react';
import { Link, Outlet } from 'react-router';
import { HeaderNav } from '@/components/header-nav';
import { Logo } from '@/components/logo';
import { Alert,AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { useCurrentMove } from '@/features/prepare/use-move';
import { StartOverButton } from '@/features/reset/start-over-button';
import { CreateMoveForm } from './create-move-form';

export function MoveShellPage() {
  const { data: move, isError, isPending } = useCurrentMove();

  return (
    <div className="min-h-dvh">
      <header className="border-b print:hidden">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
          <div className="flex min-w-0 items-center gap-2 sm:gap-4">
            <Link to="/" aria-label="MoveMate home">
              <Logo variant="mark" size={24} className="sm:hidden" />
              <Logo size={24} className="hidden sm:inline-flex" />
            </Link>
            <HeaderNav />
          </div>
          <StartOverButton />
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-6 py-12 print:p-0">
        {isPending && (
          <div className="flex flex-col gap-3" aria-hidden="true">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-64 w-full rounded-xl" />
          </div>
        )}
        {isError && (
          <Alert variant="destructive">
            <CircleAlertIcon />
            <AlertTitle>Could not load your move</AlertTitle>
            <AlertDescription>Check that the API is running, then refresh.</AlertDescription>
          </Alert>
        )}
        {move === null && <CreateMoveForm />}
        {move && <Outlet context={move} />}
      </main>
    </div>
  );
}
