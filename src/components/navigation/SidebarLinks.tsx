import classNames from 'classnames';
import type { LucideProps } from 'lucide-react';
import type { ForwardRefExoticComponent, RefAttributes } from 'react';
import { State, setGlobalState, useGlobalState } from '../../state/store';
import { useBreakpoint } from '../../hooks/useBreakpoint';

export default function SidebarLinks({
  links,
}: {
  links: {
    name: string;
    to: string;
    icon: ForwardRefExoticComponent<
      Omit<LucideProps, 'ref'> & RefAttributes<SVGSVGElement>
    >;
  }[];
}) {
  const biggerThanXS = useBreakpoint('xs');
  const [settings] = useGlobalState(State.SETTINGS);
  const { currentPage, sidebarOpen } = settings;

  return (
    <ul className="flex flex-1 flex-col gap-y-7">
      <li>
        <ul className="-mx-2.5 space-y-1">
          {links.map((link) => (
            <li key={link.name} className="w-full">
              <button
                type="button"
                onClick={() => {
                  setGlobalState(State.SETTINGS, {
                    ...settings,
                    currentPage: link.to,
                    sidebarOpen: biggerThanXS === false ? false : sidebarOpen,
                  });
                }}
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
            </li>
          ))}
        </ul>
      </li>
    </ul>
  );
}
