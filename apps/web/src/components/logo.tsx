import { cn } from '@/lib/utils';

type LogoProps = {
  variant?: 'mark' | 'wordmark';
  /** Mark height and width in px. */
  size?: number;
  className?: string;
};

function LogoMark({ size, decorative }: { size: number; decorative: boolean }) {
  return (
    <svg
      viewBox="0 0 48 48"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={3.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="shrink-0 text-primary"
      {...(decorative ? { 'aria-hidden': true } : { role: 'img', 'aria-label': 'MoveMate' })}
    >
      <path d="M7 22 24 7l17 15v16a3 3 0 0 1-3 3H10a3 3 0 0 1-3-3Z" />
      <path d="m16 28 6 6 11-12" />
    </svg>
  );
}

export function Logo({ variant = 'wordmark', size = 28, className }: LogoProps) {
  if (variant === 'mark') {
    return (
      <span className={cn('inline-flex', className)}>
        <LogoMark size={size} decorative={false} />
      </span>
    );
  }
  return (
    <span className={cn('inline-flex items-center gap-2 text-lg font-medium tracking-wide text-foreground uppercase [text-box:trim-both_cap_alphabetic]', className)}>
      <LogoMark size={size} decorative />
      MoveMate
    </span>
  );
}
