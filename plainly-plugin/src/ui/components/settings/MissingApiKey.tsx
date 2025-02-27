import { useNavigate } from '@src/ui/hooks';
import { Routes } from '@src/ui/types';
import classNames from 'classnames';
import { InfoIcon } from 'lucide-react';
import { Description, PageHeading } from '../typography';

export function MissingApiKey() {
  const { navigate, sidebarOpen } = useNavigate();

  return (
    <div
      className={classNames(
        'absolute inset-0 w-full h-screen flex items-center justify-center bg-[rgb(29,29,30)] z-10',
        sidebarOpen ? 'pl-[3.75rem] xs:pl-36' : 'pl-[3.75rem]',
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
            onClick={() => navigate(Routes.SETTINGS)}
          >
            Settings
          </button>
          .
        </Description>
      </div>
    </div>
  );
}
