import { useNotifications } from '@src/ui/hooks';
import type { Pin } from '@src/ui/types';
import classNames from 'classnames';
import { useState } from 'react';
import { PinInput } from '.';
import { State, useGlobalState } from '../../state/store';
import { Button } from '../common';
import { Description, PageHeading } from '../typography';

export function PinOverlay({
  onPinSubmitted,
}: { onPinSubmitted: (value: string | undefined) => void }) {
  const { notifyError } = useNotifications();
  const [settings] = useGlobalState(State.SETTINGS);
  const sidebarOpen = settings.sidebarOpen;

  const [pin, setPin] = useState<Pin | undefined>();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!pin?.isFilled()) {
      notifyError('All digits must be filled');
      return;
    }

    onPinSubmitted(pin.getPin());
  };

  return (
    <form
      className={classNames(
        'absolute inset-0 w-full h-screen flex items-center justify-center bg-[rgb(29,29,30)] z-10',
        sidebarOpen ? 'pl-[3.75rem] xs:pl-36' : 'pl-[3.75rem]',
      )}
      onSubmit={handleSubmit}
    >
      <div className="flex flex-col gap-y-4 items-center">
        <div>
          <PageHeading heading="Enter PIN" className="text-center" />
          <Description>Enter your 4 digit PIN to continue.</Description>
        </div>

        <div className="flex flex-col gap-y-2 w-fit">
          <PinInput pin={pin} onChange={setPin} type="password" overlay />
          <div className="flex justify-between items-center">
            <Button type="button" secondary onClick={() => setPin(undefined)}>
              Clear
            </Button>
            <Button>Submit</Button>
          </div>
        </div>
      </div>
    </form>
  );
}
