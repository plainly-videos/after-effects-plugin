import { useNavigate } from '@src/ui/hooks';
import classNames from 'classnames';
import type { LucideProps } from 'lucide-react';
import type { ForwardRefExoticComponent, RefAttributes } from 'react';
import type { Routes } from '../../types';
import { Tooltip } from '../common/Tooltip';

export default function SidebarLinks({
  links,
}: {
  links: {
    name: string;
    to: Routes;
    icon: ForwardRefExoticComponent<
      Omit<LucideProps, 'ref'> & RefAttributes<SVGSVGElement>
    >;
  }[];
}) {
  const { navigate, currentPage, sidebarOpen } = useNavigate();

  return (
    <ul className="flex flex-1 flex-col gap-y-7">
      <li>
        <ul className="-mx-2.5 space-y-1">
          {links.map((link) => (
            <li key={link.name} className="w-full">
              <Tooltip text={link.name} position="right" disabled={sidebarOpen}>
                <button
                  type="button"
                  onClick={() => navigate(link.to)}
                  className={classNames(
                    link.to === currentPage
                      ? 'bg-[rgb(43,43,43)] text-white'
                      : 'text-gray-400 hover:bg-[rgb(43,43,43)] hover:text-white',
                    'group flex gap-x-2 rounded-md px-2 py-1 text-xs font-medium relative items-center w-full min-h-[25px]',
                  )}
                >
                  <link.icon aria-hidden="true" className="size-4 shrink-0" />
                  {sidebarOpen && link.name}
                </button>
              </Tooltip>
            </li>
          ))}
        </ul>
      </li>
    </ul>
  );
}
