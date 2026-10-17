import { Building2Icon, CalendarCheckIcon, ShieldCheckIcon } from 'lucide-react';

const points = [
  { icon: Building2Icon, text: 'A landlord’s insurance usually covers the building, not your belongings.' },
  { icon: ShieldCheckIcon, text: 'Home insurance can help with things like fire, water damage or theft. Check what your policy covers.' },
  { icon: CalendarCheckIcon, text: 'Arrange it before your first night, and check when the cover starts.' },
];

export function InsuranceExplainer() {
  return (
    <div className="flex flex-col gap-3 rounded-xl bg-muted p-4">
      <p className="font-medium">Why you need it when you move in</p>
      <ul className="flex flex-col gap-2 text-muted-foreground">
        {points.map(({ icon: Icon, text }) => (
          <li key={text} className="flex items-start gap-3">
            <Icon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            <span>{text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
