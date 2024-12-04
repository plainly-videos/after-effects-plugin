'use client';

import classNames from 'classnames';
import { State, useGlobalState } from '../../state/store';
import Footer from '../footer/Footer';

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
        sidebarOpen ? 'pl-56' : 'pl-[3.75rem]',
        'border-t border-t-white/10',
      )}
    >
      <div className="p-12 sm:p-14 lg:p-20 min-h-screen justify-between items-center flex flex-col">
        {children}
        <Footer />
      </div>
    </main>
  );
}
