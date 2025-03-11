import type { Routes } from '@src/ui/types';
import { ChevronRightIcon } from 'lucide-react';
import { InternalLink } from './Link';

export function Breadcrumbs({ children }: { children: React.ReactNode }) {
  return (
    <nav aria-label="Breadcrumb" className="flex">
      <ol className="flex items-center space-x-2 text-sm/7 font-medium">
        {children}
      </ol>
    </nav>
  );
}

export function Breadcrumb({
  to,
  label,
  firstItem,
}: {
  to: { path: Routes; params?: { [key: string]: string } };
  label: string;
  firstItem?: boolean;
}) {
  return (
    <li>
      <div className="flex items-center">
        {!firstItem && (
          <ChevronRightIcon
            aria-hidden="true"
            className="size-4 shrink-0 text-gray-400 mr-2"
          />
        )}
        <InternalLink to={to} text={label} noUnderline />
      </div>
    </li>
  );
}
