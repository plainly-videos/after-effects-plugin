'use client';

import classNames from 'classnames';
import { State, useGlobalState } from '../../state/store';

export default function MainWrapper({
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
          ? 'pl-[3.75rem] blur-md pointer-events-none xs:pl-48 xs:blur-none xs:pointer-events-auto'
          : 'pl-[3.75rem]',
      )}
    >
      <div className="p-6 sm:p-14 lg:p-20 min-h-screen justify-between items-center flex flex-col">
        {children}
      </div>
    </main>
  );
}