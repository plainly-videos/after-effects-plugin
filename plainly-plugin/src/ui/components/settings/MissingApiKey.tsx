import classNames from 'classnames';
import { InfoIcon } from 'lucide-react';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import { State, setGlobalState, useGlobalState } from '../../state/store';
import { Routes } from '../../types';
import Description from '../typography/Description';
import PageHeading from '../typography/PageHeading';

export default function MissingApiKey() {
  const biggerThanXS = useBreakpoint('xs');
  const [settings] = useGlobalState(State.SETTINGS);
  const sidebarOpen = settings.sidebarOpen;

  return (
    <div
      className={classNames(
        'absolute inset-0 w-full h-screen flex items-center justify-center bg-[rgb(29,29,30)] z-10',
        sidebarOpen ? 'pl-[3.75rem] xs:pl-48' : 'pl-[3.75rem]',
      )}
    >
      <div className="p-6 sm:p-14 lg:p-20 flex flex-col items-center justify-center">
        <InfoIcon className="text-blue-400" />
        <PageHeading heading="Missing API key" />
        <Description>
          To use this feature you need to add your{' '}
          <span className="text-white">Plainly API key</span> in the{' '}
          <button
            type="button"
            className="text-white underline"
            onClick={() => {
              setGlobalState(State.SETTINGS, {
                ...settings,
                currentPage: Routes.SETTINGS,
                sidebarOpen: biggerThanXS === false ? false : sidebarOpen,
              });
            }}
          >
            Settings
          </button>
          .
        </Description>
      </div>
    </div>
  );
}
