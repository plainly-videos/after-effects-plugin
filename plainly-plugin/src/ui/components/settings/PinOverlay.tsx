import type { Pin } from '@src/ui/types';
import { useState } from 'react';
import { useNotification } from '../../hooks/useNotification';
import { useSessionStorage } from '../../hooks/useSessionStorage';
import { useSettings } from '../../hooks/useSettings';
import Button from '../common/Button';
import Notification from '../common/Notification';
import Description from '../typography/Description';
import PageHeading from '../typography/PageHeading';
import PinInput from './PinInput';

export default function PinOverlay({
  onSubmit,
}: {
  onSubmit: (key: string) => void;
}) {
  const [pin, setPin] = useState<Pin | undefined>();
  const { getSettingsApiKey } = useSettings();
  const { setItem } = useSessionStorage();
  const { notification, notifyError, clearNotification } = useNotification();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (pin) {
      const { key, error } = getSettingsApiKey(true, pin.getPin());
      if (error) {
        notifyError(error);
        return;
      }

      if (key) {
        setItem('pin', pin.getPin());
        onSubmit(key);
      }
    }
  };

  const onCancel = () => {
    const { key } = getSettingsApiKey();
    if (key) {
      setItem('pin', '');
      onSubmit(key);
    }
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
          <PinInput pin={pin} onChange={setPin} type="password" />
          <div className="flex justify-between items-center">
            <Button type="button" secondary onClick={onCancel}>
              Cancel
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
