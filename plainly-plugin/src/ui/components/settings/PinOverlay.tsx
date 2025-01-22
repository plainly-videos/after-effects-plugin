import type { Pin } from '@src/ui/types';
import { type Dispatch, type SetStateAction, useState } from 'react';
import { useSettings } from '../../hooks/useSettings';
import Button from '../common/Button';
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (pin) {
      const { key } = getSettingsApiKey(true, pin);
      if (key) onSubmit(key);
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
            <Button type="button" secondary>
              Cancel
            </Button>
            <Button>Submit</Button>
          </div>
        </div>
      </div>
    </form>
  );
}
