import { InfoIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

const points = [
  'A landlord’s insurance usually covers the building, not your belongings.',
  'Home insurance can help with things like fire, water damage or theft. Check what your policy covers.',
  'Arrange it before your first night, and check when the cover starts.',
];

export function InsuranceInfoPopover({ defaultOpen = false }: { defaultOpen?: boolean }) {
  return (
    <Popover defaultOpen={defaultOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label="About home insurance">
          <InfoIcon />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-80 gap-3 p-4">
        <p className="font-medium">Why home insurance matters</p>
        <ul className="flex list-disc flex-col gap-2 pl-4 text-muted-foreground">
          {points.map((point) => (
            <li key={point}>{point}</li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  );
}
