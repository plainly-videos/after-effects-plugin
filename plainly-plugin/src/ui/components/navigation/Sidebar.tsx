import { pages } from '@src/ui/routes';
import { State, setGlobalState, useGlobalState } from '@src/ui/state/store';
import classNames from 'classnames';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { PlainlyLogo } from '../logo';
import { SidebarLinks, SidebarResources } from '.';

export function Sidebar() {
  const [settings] = useGlobalState(State.SETTINGS);
  const sidebarOpen = settings.sidebarOpen;

  const handleSidebarOpen = () => {
    setGlobalState(State.SETTINGS, {
      ...settings,
      sidebarOpen: !sidebarOpen,
    });
  };

  return (
    <div
      className={classNames(
        'fixed left-0 inset-y-0 z-20 flex flex-col border-r border-r-white/10 bg-[rgb(29,29,30)]',
        sidebarOpen ? 'w-[80%] xs:w-36' : 'w-[3.75rem]',
      )}
    >
      {/* Sidebar component, swap this element with another sidebar if you like */}
      <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-[rgb(29,29,30/1)] px-6 py-5">
        <nav className="flex flex-1 flex-col">
          <SidebarLinks links={pages} />
          <div>
            <SidebarResources />
            <div className="flex shrink-0 h-8 items-center justify-between">
              {sidebarOpen && <PlainlyLogo className="h-8 w-auto" />}
              <button
                type="button"
                onClick={handleSidebarOpen}
                className="text-gray-400 hover:text-white hover:bg-[rgb(43,43,43)] cursor-pointer rounded-md px-2 py-1 flex items-center justify-center text-xs -mx-2.5 h-[25px]"
              >
                {sidebarOpen ? (
                  <ChevronLeftIcon className="size-4 shrink-0" />
                ) : (
                  <ChevronRightIcon className="size-4 shrink-0" />
                )}
              </button>
            </div>
          </div>
        </nav>
      </div>
    </div>
  );
}
