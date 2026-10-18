import { useState } from 'react';
import { ListChecksIcon } from 'lucide-react';
import { ChecklistPanel } from '@/components/checklist-panel';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { countChecklist } from '@/lib/checklist-status';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

type ChecklistDrawerProps = Parameters<typeof ChecklistPanel>[0];

export function ChecklistDrawer({ entries, onStatusChange, roomChecks, phase }: ChecklistDrawerProps) {
  const { handled, left } = countChecklist(entries);
  const [open, setOpen] = useState(false);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="secondary">
          <ListChecksIcon data-icon="inline-start" />
          Move checklist ({handled} of {entries.length})
          <Badge variant={left === 0 ? 'success' : 'secondary'}>{left} left</Badge>
        </Button>
      </SheetTrigger>
      <SheetContent className="overflow-y-auto data-[side=right]:w-full data-[side=right]:sm:max-w-sm">
        <SheetHeader className="sr-only">
          <SheetTitle>Move checklist</SheetTitle>
          <SheetDescription>Answer each item. Nothing here blocks your move.</SheetDescription>
        </SheetHeader>
        <ChecklistPanel entries={entries} onStatusChange={onStatusChange} roomChecks={roomChecks} phase={phase} onRoomNavigate={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  );
}
