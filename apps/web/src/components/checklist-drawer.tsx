import { isHandled } from '@movemate/contracts';
import { useState } from 'react';
import { ListChecksIcon } from 'lucide-react';
import { ChecklistPanel } from '@/components/checklist-panel';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

type ChecklistDrawerProps = Parameters<typeof ChecklistPanel>[0];

export function ChecklistDrawer({ entries, onStatusChange, roomChecks }: ChecklistDrawerProps) {
  const handled = entries.filter((entry) => isHandled(entry.status)).length;
  const [open, setOpen] = useState(false);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="secondary">
          <ListChecksIcon data-icon="inline-start" />
          Move checklist ({handled} of {entries.length})
        </Button>
      </SheetTrigger>
      <SheetContent className="overflow-y-auto data-[side=right]:w-full data-[side=right]:sm:max-w-sm">
        <SheetHeader className="sr-only">
          <SheetTitle>Move checklist</SheetTitle>
          <SheetDescription>Answer each item. Nothing here blocks your move.</SheetDescription>
        </SheetHeader>
        <ChecklistPanel entries={entries} onStatusChange={onStatusChange} roomChecks={roomChecks} onRoomNavigate={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  );
}
