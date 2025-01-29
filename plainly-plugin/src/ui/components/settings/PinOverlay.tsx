import { useState } from 'react';
import { useNotification } from '../../hooks/useNotification';
import type { Pin } from '../../types';
import Button from '../common/Button';
import Notification from '../common/Notification';
import Description from '../typography/Description';
import PageHeading from '../typography/PageHeading';
import PinInput from './PinInput';

export default function PinOverlay({
  setPinStorage,
}: { setPinStorage: (value: string | undefined) => void }) {
  const [pin, setPin] = useState<Pin | undefined>();
  const { notification, notifyError, clearNotification } = useNotification();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!pin?.isFilled()) {
      notifyError('All digits must be filled');
      return;
    }

    setPinStorage(pin.getPin());
  };

  return (
    <form
      className="absolute inset-0 w-full h-screen flex items-center justify-center bg-[rgb(29,29,30)] z-10"
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
      {notification && (
        <Notification
          title={notification.title}
          type={notification.type}
          description={notification.description}
          onClose={clearNotification}
        />
      )}
    </form>
  );
}
