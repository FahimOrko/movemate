import { ExternalLinkIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type ProviderCardProps = { name: string; highlighted?: boolean; url?: string | null };

export function ProviderCard({ name, highlighted = false, url = null }: ProviderCardProps) {
  if (!highlighted) {
    return (
      <Card variant="surface" size="sm">
        <CardHeader>
          <CardTitle>{name}</CardTitle>
        </CardHeader>
      </Card>
    );
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {name}
          <Badge variant="success">MoveMate partner</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-start gap-4">
        <p className="text-muted-foreground">MoveMate users get a discount with If.</p>
        {url && (
          <Button asChild>
            <a href={url} target="_blank" rel="noopener noreferrer">
              Get a quote from {name}
              <ExternalLinkIcon data-icon="inline-end" />
            </a>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
