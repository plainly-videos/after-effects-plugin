import { useState } from 'react';
import { useNotification } from '../../hooks/useNotification';
import { useSessionStorage } from '../../hooks/useSessionStorage';
import { decode } from '../../node/encoding';
import { getSettings } from '../../node/settings';
import type { Pin } from '../../types';
import Button from '../common/Button';
import Notification from '../common/Notification';
import Description from '../typography/Description';
import PageHeading from '../typography/PageHeading';
import { PinInput } from './SettingsForm';

export default function PinOverlay({ close }: { close: () => void }) {
  const [pin, setPin] = useState<Pin>();
  const { notification, notifyError, clearNotification } = useNotification();
  const { setItem } = useSessionStorage();

  const disabled = !pin || Object.values(pin).some((value) => !value);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!disabled) {
      const settings = await getSettings();
      const secret = `${pin.first}${pin.second}${pin.third}${pin.fourth}`;
      if (settings.apiKey) {
        try {
          decode(secret, settings.apiKey);
          setItem('pin', JSON.stringify(pin));
          close();
        } catch (error) {
          notifyError('Invalid PIN');
        }
      }
    }
  };

  return (
    <form
      className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center backdrop-blur-md z-30"
      onSubmit={handleSubmit}
    >
      <div className="w-[155px]">
        <PageHeading heading="Confirm PIN" className="text-center" />
        <Description className="text-center">
          Please confirm your PIN to use your API key
        </Description>
        <PinInput pin={pin} onChange={setPin} className="mt-2" />
        <div className="flex justify-between mt-2">
          <Button
            type="button"
            secondary
            onClick={() => {
              setItem('pin', '');
              close();
            }}
          >
            Cancel
          </Button>
          <Button disabled={disabled}>Confirm</Button>
        </div>
      </div>
      {notification && (
        <Notification
          title={notification.title}
          type={notification.type}
          onClose={clearNotification}
        />
      )}
    </form>
  );
}
