import { NavLink } from 'react-router';
import { Button } from '@/components/ui/button';

const links = [
  { to: '/demo', label: 'Demo' },
  { to: '/design', label: 'Design' },
];

export function HeaderNav() {
  return (
    <nav aria-label="Pages" className="flex shrink-0 items-center gap-1">
      {links.map(({ to, label }) => (
        <Button
          key={to}
          asChild
          variant="ghost"
          size="sm"
          className="aria-[current=page]:bg-secondary aria-[current=page]:text-foreground"
        >
          <NavLink to={to}>{label}</NavLink>
        </Button>
      ))}
    </nav>
  );
}
