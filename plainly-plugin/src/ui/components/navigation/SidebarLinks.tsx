import { useNavigate } from '@src/ui/hooks';
import type { Page, Separator } from '@src/ui/routes';
import { isEmpty } from '@src/ui/utils';
import classNames from 'classnames';
import { useContext } from 'react';
import { Tooltip } from '../common/Tooltip';
import { GlobalContext } from '../context';

export function SidebarLinks({ links }: { links: (Page | Separator)[] }) {
  const { navigate, currentPage, sidebarOpen } = useNavigate();
  const { projectIssues } = useContext(GlobalContext) || {};

  const valid = isEmpty(projectIssues);

  return (
    <ul className="flex flex-1 flex-col gap-y-7">
      <li>
        <ul className="-mx-2.5 space-y-1">
          {links.map((link) =>
            link.type === 'page' ? (
              <li key={link.name} className="w-full h-[25px]">
                <Tooltip
                  text={link.name}
                  position="right"
                  disabled={sidebarOpen}
                >
                  <button
                    type="button"
                    onClick={() => navigate(link.to)}
                    className={classNames(
                      link.to === currentPage
                        ? 'bg-[rgb(43,43,43)] text-white'
                        : 'text-gray-400 hover:bg-[rgb(43,43,43)] hover:text-white',
                      'group flex gap-x-2 rounded-md px-2 py-1 text-xs font-medium relative items-center w-full h-[25px]',
                    )}
                  >
                    <link.icon aria-hidden="true" className="size-4 shrink-0" />
                    {valid === false && link.name === 'Validate' && (
                      <span className="absolute top-0.5 right-1 inline-flex items-center justify-center h-2 w-2 bg-yellow-600 rounded-full" />
                    )}
                    {sidebarOpen && link.name}
                  </button>
                </Tooltip>
              </li>
            ) : (
              <li key={link.name} className="border-t border-white/10" />
            ),
          )}
        </ul>
      </li>
    </ul>
  );
}
