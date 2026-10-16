import { CircleAlertIcon, HouseIcon, InfoIcon } from 'lucide-react';
import { Link } from 'react-router';
import { InteractiveBackground } from '@/components/interactive-background';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/spinner';
import { DesignSection } from './design-section';

// Class names are written out in full so Tailwind can find them.
// Class names are written out in full so Tailwind can find them. Hex values are documentation of the tokens in index.css.
type Swatch = { token: string; hex: string; swatch: string };

const colorTokens: Swatch[] = [
  { token: 'background', hex: '#FFFFFF', swatch: 'bg-background' },
  { token: 'surface', hex: '#F5F5F7', swatch: 'bg-surface' },
  { token: 'foreground', hex: '#1D1D1F', swatch: 'bg-foreground' },
  { token: 'muted-foreground', hex: '#6E6E73', swatch: 'bg-muted-foreground' },
  { token: 'border / grid', hex: '#D2D2D7', swatch: 'bg-border' },
  { token: 'input', hex: '#86868B', swatch: 'bg-input' },
  { token: 'primary', hex: '#0071E3', swatch: 'bg-primary' },
  { token: 'primary-hover', hex: '#0077ED', swatch: 'bg-primary-hover' },
  { token: 'primary-pressed', hex: '#006EDB', swatch: 'bg-primary-pressed' },
  { token: 'ring', hex: '#0071E3 at 40%', swatch: 'bg-ring/40' },
];

const statusTokens: Swatch[] = [
  { token: 'success', hex: '#34C759', swatch: 'bg-success' },
  { token: 'success-text', hex: '#1F7A38', swatch: 'bg-success-text' },
  { token: 'warning', hex: '#FF9500', swatch: 'bg-warning' },
  { token: 'warning-text', hex: '#A64B00', swatch: 'bg-warning-text' },
  { token: 'destructive', hex: '#FF3B30', swatch: 'bg-destructive' },
  { token: 'destructive-text', hex: '#C9000F', swatch: 'bg-destructive-text' },
];

function SwatchList({ swatches }: { swatches: Swatch[] }) {
  return (
    <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {swatches.map(({ token, hex, swatch }) => (
        <li key={token} className="flex items-center gap-3">
          <span className={`size-10 shrink-0 rounded-lg border ${swatch}`} />
          <span className="flex flex-col text-sm">
            {token}
            <code className="text-xs text-muted-foreground">{hex}</code>
          </span>
        </li>
      ))}
    </ul>
  );
}

const typeScale = [
  { token: 'text-display', className: 'text-display', sample: 'Move in with proof.' },
  { token: 'text-title', className: 'text-title', sample: 'Before photos' },
  { token: 'text-heading', className: 'text-heading', sample: 'Kitchen' },
  { token: 'text-base', className: 'text-base', sample: 'A mark may be visible on the counter near the sink.' },
  { token: 'text-sm', className: 'text-sm', sample: 'Uploaded 12 Oct 2026, 14:32' },
  { token: 'text-xs', className: 'text-xs', sample: 'JPEG, PNG or WebP' },
];

const spacingScale = [
  { step: '1', bar: 'w-1' },
  { step: '2', bar: 'w-2' },
  { step: '3', bar: 'w-3' },
  { step: '4', bar: 'w-4' },
  { step: '6', bar: 'w-6' },
  { step: '8', bar: 'w-8' },
  { step: '12', bar: 'w-12' },
  { step: '16', bar: 'w-16' },
  { step: '24', bar: 'w-24' },
];

const radiusScale = [
  { token: 'rounded-sm', className: 'rounded-sm' },
  { token: 'rounded-md', className: 'rounded-md' },
  { token: 'rounded-lg', className: 'rounded-lg' },
  { token: 'rounded-xl', className: 'rounded-xl' },
  { token: 'rounded-4xl', className: 'rounded-4xl' },
];

const buttonVariants = ['default', 'secondary', 'ghost', 'destructive', 'link'] as const;
const buttonSizes = ['sm', 'default', 'lg', 'xl'] as const;
const badgeVariants = ['default', 'secondary', 'outline'] as const;
const statusBadgeVariants = ['success', 'warning', 'destructive'] as const;

export function DesignPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <header className="flex flex-wrap items-end justify-between gap-4 pb-12">
        <div>
          <h1 className="text-title">Design system</h1>
          <p className="mt-2 max-w-prose text-muted-foreground">
            Every token and component MoveMate uses, in each of its states.
          </p>
        </div>
        <Button asChild variant="secondary">
          <Link to="/">Back to MoveMate</Link>
        </Button>
      </header>

      <DesignSection id="colors" title="Colors" description="Apple's palette. Light theme only.">
        <SwatchList swatches={colorTokens} />
        <div className="flex flex-col gap-3">
          <p className="text-sm text-muted-foreground">
            Status colors. Findings and errors only, never decoration. Use the fill for borders and icons and the text
            variant for words, because the fills fail 4.5:1 on white.
          </p>
          <SwatchList swatches={statusTokens} />
        </div>
      </DesignSection>

      <DesignSection id="type" title="Typography" description="System font stack, so Apple devices render SF. Three custom steps on top of Tailwind's base, sm and xs.">
        <ul className="flex flex-col gap-5">
          {typeScale.map((step) => (
            <li key={step.token} className="grid gap-1 sm:grid-cols-4 sm:items-baseline sm:gap-6">
              <code className="text-xs text-muted-foreground">{step.token}</code>
              <span className={`min-w-0 sm:col-span-3 ${step.className}`}>{step.sample}</span>
            </li>
          ))}
        </ul>
      </DesignSection>

      <DesignSection id="spacing" title="Spacing and radius" description="Tailwind's 4px spacing steps. Inputs use rounded-lg (10px), cards rounded-xl (16px), buttons and badges are pills.">
        <ul className="flex flex-col gap-2">
          {spacingScale.map((space) => (
            <li key={space.step} className="flex items-center gap-4">
              <code className="w-8 text-xs text-muted-foreground">{space.step}</code>
              <span className={`h-3 rounded-sm bg-primary ${space.bar}`} />
            </li>
          ))}
        </ul>
        <ul className="flex flex-wrap gap-4">
          {radiusScale.map((radius) => (
            <li key={radius.token} className="flex flex-col items-center gap-2">
              <span className={`size-14 border-2 border-primary bg-accent ${radius.className}`} />
              <code className="text-xs text-muted-foreground">{radius.token}</code>
            </li>
          ))}
        </ul>
      </DesignSection>

      <DesignSection id="buttons" title="Button" description="Pills. Hover and press show primary-hover and primary-pressed. Press Tab to see the blue focus ring.">
        <div className="flex flex-wrap items-center gap-3">
          {buttonVariants.map((variant) => (
            <Button key={variant} variant={variant}>
              {variant}
            </Button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {buttonSizes.map((size) => (
            <Button key={size} size={size}>
              Size {size}
            </Button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button disabled>Disabled</Button>
          <Button disabled aria-busy="true">
            <Spinner data-icon="inline-start" />
            Saving
          </Button>
          <Button variant="secondary" disabled>
            Disabled secondary
          </Button>
        </div>
      </DesignSection>

      <DesignSection id="inputs" title="Input and label" description="Label above, error text below.">
        <div className="grid max-w-md gap-6">
          <div className="grid gap-2">
            <Label htmlFor="design-address">Address</Label>
            <Input id="design-address" placeholder="Aurakatu 12 B 7, Turku" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="design-disabled">Disabled</Label>
            <Input id="design-disabled" disabled value="Aurakatu 12 B 7, Turku" readOnly />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="design-error">With error</Label>
            <Input id="design-error" aria-invalid="true" aria-describedby="design-error-text" defaultValue="" />
            <p id="design-error-text" className="text-sm text-destructive-text">
              Enter the address you are moving into.
            </p>
          </div>
        </div>
      </DesignSection>

      <DesignSection id="cards" title="Card" description="White with a soft shadow, or the surface color with none.">
        <div className="grid gap-6 sm:grid-cols-2">
          {(['default', 'surface'] as const).map((variant) => (
            <Card key={variant} variant={variant}>
              <CardHeader>
                <CardTitle>Kitchen</CardTitle>
                <CardDescription>4 before photos</CardDescription>
              </CardHeader>
              <CardContent className="text-sm">Check whether the counter edge near the sink is chipped.</CardContent>
              <CardFooter>
                <Button variant="secondary" size="sm">
                  Add a check
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </DesignSection>

      <DesignSection id="badges" title="Badge" description="Status badges are for findings and errors only.">
        <div className="flex flex-wrap items-center gap-3">
          {badgeVariants.map((variant) => (
            <Badge key={variant} variant={variant}>
              {variant}
            </Badge>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {statusBadgeVariants.map((variant) => (
            <Badge key={variant} variant={variant}>
              {variant}
            </Badge>
          ))}
        </div>
      </DesignSection>

      <DesignSection id="states" title="Empty, loading and error states">
        <Empty className="border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <HouseIcon />
            </EmptyMedia>
            <EmptyTitle>No move yet</EmptyTitle>
            <EmptyDescription>Your move-in steps will show up here.</EmptyDescription>
          </EmptyHeader>
        </Empty>
        <div className="flex flex-col gap-3" aria-hidden="true">
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-32 w-full rounded-xl" />
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Spinner />
          Loading
        </div>
        <Alert>
          <InfoIcon />
          <AlertTitle>Heads up</AlertTitle>
          <AlertDescription>Different angles and lighting are expected between photos.</AlertDescription>
        </Alert>
        <Alert variant="destructive">
          <CircleAlertIcon />
          <AlertTitle>Something went wrong</AlertTitle>
          <AlertDescription>Try again in a moment.</AlertDescription>
        </Alert>
      </DesignSection>

      <DesignSection id="background" title="Interactive background" description="Landing page canvas. Follows the pointer; static under reduced motion.">
        <div className="relative h-72 overflow-hidden rounded-xl border bg-background">
          <InteractiveBackground />
        </div>
      </DesignSection>
    </div>
  );
}
