import type { Photo } from "@movemate/contracts";
import { HomeIcon } from "lucide-react";
import { Link } from "react-router";
import { DiscountBadge } from "@/components/discount-badge";
import { EnlargeablePhoto } from "@/components/enlargeable-photo";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { demoListing } from "@/features/demo/demo-data";
import { useSettleInGuidance } from "@/features/settle-in/use-settle-in";

const containerClass = "mx-auto w-full max-w-6xl px-4 md:px-6";

// shortcut: static fake photos for a video prop, only url and dimensions are read.
const galleryPhoto = (file: string): Photo => ({
  id: file,
  moveId: file,
  stage: "before",
  room: "living_room",
  width: 1600,
  height: 1200,
  createdAt: "2026-01-01T00:00:00.000Z",
  url: `/demo/${file}`,
});

const bedroom = galleryPhoto(demoListing.photos.bedroom);
const kitchen = galleryPhoto(demoListing.photos.kitchen);
const { landlord } = demoListing;

export function DemoPage() {
  const guidance = useSettleInGuidance();
  const ifDiscount = guidance.data?.providers.find(
    (provider) => provider.key === "insurance-if",
  )?.discount;

  return (
    <div className="min-h-svh bg-background text-foreground">
      <header className="border-b">
        <div className={`${containerClass} flex items-center gap-2 py-4`}>
          <HomeIcon className="size-5 text-primary" aria-hidden="true" />
          <span className="text-lg font-medium">{demoListing.brand}</span>
          <span className="ml-auto hidden text-sm text-muted-foreground sm:inline">
            {demoListing.tagline}
          </span>
        </div>
      </header>
      <main className={`${containerClass} flex flex-col gap-6 py-8`}>
        <div className="flex flex-col gap-2">
          <h1 className="text-title">{demoListing.title}</h1>
          <p className="text-muted-foreground">
            {demoListing.address} · {demoListing.rentalNumber}
          </p>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="flex min-w-0 flex-col gap-6 lg:col-span-2">
            <div className="grid grid-cols-2 gap-6">
              <EnlargeablePhoto
                photo={bedroom}
                label="Bedroom of the apartment"
                className="w-full"
              />
              <EnlargeablePhoto
                photo={kitchen}
                label="Kitchen of the apartment"
                className="w-full"
              />
            </div>
            <Card variant="surface">
              <CardContent>
                <dl className="grid grid-cols-3 gap-4">
                  {demoListing.keyFacts.map((fact) => (
                    <div key={fact.label}>
                      <dt className="text-sm text-muted-foreground">
                        {fact.label}
                      </dt>
                      <dd className="font-medium">{fact.value}</dd>
                    </div>
                  ))}
                </dl>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                {demoListing.description}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Details</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableBody>
                    {demoListing.details.map(({ name, value }) => (
                      <TableRow key={name}>
                        <TableCell className="w-2/5 whitespace-normal py-3 pl-0 text-muted-foreground">
                          {name}
                        </TableCell>
                        <TableCell className="whitespace-normal py-3 pr-0">
                          {value}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
          <aside className="flex min-w-0 flex-col gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Contact the landlord</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <p>{landlord.agent}</p>
                  <p className="text-muted-foreground">{landlord.company}</p>
                  <p className="break-all text-muted-foreground">
                    {landlord.email}
                  </p>
                </div>
                <Separator />
                <Button asChild variant="secondary">
                  <a href={`tel:${landlord.phone.replaceAll(" ", "")}`}>
                    {landlord.phone}
                  </a>
                </Button>
                <Button type="button">Send a message</Button>
              </CardContent>
            </Card>
            <Card variant="surface">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Logo variant="mark" size={24} />
                  Moving in? Document the home from day one.
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <Button asChild size="lg">
                  <Link to="/move" target="_blank" rel="noopener noreferrer">Start my move</Link>
                </Button>
                <Button asChild variant="link" className="self-start px-0">
                  <a href="/api/demo/contract" target="_blank" rel="noopener noreferrer">
                    Sample lease (PDF)
                  </a>
                </Button>
                {ifDiscount && (
                  <p className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                    Home insurance required: get it with If
                    <DiscountBadge discount={ifDiscount} />
                  </p>
                )}
              </CardContent>
            </Card>
          </aside>
        </div>
      </main>
    </div>
  );
}
