import { isHandled } from '@movemate/contracts';
import { ListChecksIcon } from 'lucide-react';
import { ChecklistPanel } from '@/components/checklist-panel';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

type ChecklistDrawerProps = Parameters<typeof ChecklistPanel>[0];

export function ChecklistDrawer({ entries, onStatusChange }: ChecklistDrawerProps) {
  const handled = entries.filter((entry) => isHandled(entry.status)).length;
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="secondary">
          <ListChecksIcon data-icon="inline-start" />
          Checklist ({handled} of {entries.length})
        </Button>
      </SheetTrigger>
      <SheetContent className="overflow-y-auto data-[side=right]:w-full data-[side=right]:sm:max-w-sm">
        <SheetHeader className="sr-only">
          <SheetTitle>Checklist</SheetTitle>
          <SheetDescription>Answer each item. Nothing here blocks your move.</SheetDescription>
        </SheetHeader>
        <ChecklistPanel entries={entries} onStatusChange={onStatusChange} />
      </SheetContent>
    </Sheet>
  );
}
