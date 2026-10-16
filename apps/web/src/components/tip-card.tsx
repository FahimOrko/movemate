import { LightbulbIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function TipCard({ title, body }: { title: string; body: string }) {
  return (
    <Card variant="surface">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <LightbulbIcon className="size-4 text-muted-foreground" aria-hidden="true" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="text-muted-foreground">{body}</CardContent>
    </Card>
  );
}
