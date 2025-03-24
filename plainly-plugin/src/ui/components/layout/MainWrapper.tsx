import { State, useGlobalState } from '@src/ui/state/store';
import classNames from 'classnames';
import { NotificationsOverlay } from '../common';

export function MainWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const [settings] = useGlobalState(State.SETTINGS);
  const sidebarOpen = settings.sidebarOpen;

  return (
    <main
      className={classNames(
        sidebarOpen
          ? 'pl-[3.75rem] blur-md pointer-events-none xs:pl-36 xs:blur-none xs:pointer-events-auto'
          : 'pl-[3.75rem]',
      )}
    >
      <div className="p-4 sm:p-14 lg:p-20 justify-between items-center flex flex-col">
        {children}
      </div>
      <NotificationsOverlay />
    </main>
  );
}
