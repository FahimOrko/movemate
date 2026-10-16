import type { ReactNode } from 'react';

type DesignSectionProps = {
  id: string;
  title: string;
  description?: string;
  children: ReactNode;
};

export function DesignSection({ id, title, description, children }: DesignSectionProps) {
  return (
    <section aria-labelledby={id} className="grid gap-6 border-t py-12 md:grid-cols-4 md:gap-10">
      <div>
        <h2 id={id} className="text-heading">
          {title}
        </h2>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      <div className="flex min-w-0 flex-col gap-6 md:col-span-3">{children}</div>
    </section>
  );
}
