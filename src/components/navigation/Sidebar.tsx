import classNames from 'classnames';
import { ChevronLeftIcon, ChevronRightIcon, FolderOutput } from 'lucide-react';
import { useEffect } from 'react';
import { State, setGlobalState, useGlobalState } from '../../state/store';
import PlainlyLogo from '../logo/PlainlyLogo';
import SidebarLinks from './SidebarLinks';

export default function Sidebar() {
  const [settings] = useGlobalState(State.SETTINGS);
  const sidebarOpen = settings.sidebarOpen;
  const currentPage = settings.currentPage;

  const navigation = [
    {
      name: 'Export',
      to: '/export',
      icon: FolderOutput,
      current: currentPage === '/export',
    },
  ];

  const handleSidebarOpen = () => {
    setGlobalState(State.SETTINGS, {
      ...settings,
      sidebarOpen: !sidebarOpen,
    });
  };

  useEffect(() => {
    const firstLink = document.querySelector('a');
    if (firstLink) firstLink.click();
  }, []);

  return (
    <div
      className={classNames(
        'fixed left-0 inset-y-0 z-50 flex flex-col border-r border-r-white/10',
        sidebarOpen ? 'w-64' : 'w-[3.75rem]',
      )}
    >
      {/* Sidebar component, swap this element with another sidebar if you like */}
      <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-gray-900 px-6 py-5">
        <nav className="flex flex-1 flex-col">
          <SidebarLinks links={navigation} sidebarOpen={!!sidebarOpen} />
          <div className="flex shrink-0 h-12 items-center justify-between">
            {sidebarOpen && <PlainlyLogo className="h-12 w-auto" />}
            <button
              type="button"
              onClick={handleSidebarOpen}
              className="text-gray-400 hover:text-white hover:bg-gray-800 cursor-pointer rounded-md px-2 py-1 flex items-center justify-center text-xs -mx-3"
            >
              {sidebarOpen ? (
                <ChevronLeftIcon className="size-4 shrink-0" />
              ) : (
                <ChevronRightIcon className="size-4 shrink-0" />
              )}
            </button>
          </div>
        </nav>
      </div>
    </div>
  );
}
