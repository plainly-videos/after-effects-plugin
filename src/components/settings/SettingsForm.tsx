import { EyeIcon, EyeOffIcon } from 'lucide-react';
import { type SetStateAction, useCallback, useState } from 'react';
import Button from '../common/Button';
import Label from '../typography/Label';
import Description from '../typography/Description';
import PageHeading from '../typography/PageHeading';
import Notification from '../common/Notification';
import { useNotification } from '../../hooks/useNotification';
import { handleLinkClick } from '../../utils';
import classNames from 'classnames';
import { setSettingsApiKey } from '../../node/settings';
import type { Pin } from '../../types';

export default function ExportForm() {
  const [showApiKey, setShowApiKey] = useState(false);
  const [loading, setLoading] = useState(false);
  const { notification, notifySuccess, notifyError, clearNotification } =
    useNotification();

  const [apiKey, setApiKey] = useState<string>();
  const [pin, setPin] = useState<Pin>({
    first: undefined,
    second: undefined,
    third: undefined,
    fourth: undefined,
  });
  const [confirmPin, setConfirmPin] = useState<Pin>({
    first: undefined,
    second: undefined,
    third: undefined,
    fourth: undefined,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (apiKey) {
      try {
        await setSettingsApiKey(apiKey, pin, confirmPin);
        notifySuccess('Settings saved successfully');
        setLoading(false);
      } catch (error) {
        notifyError('Failed to save settings', (error as Error).message);
        setLoading(false);
      }
    }
  };

  return (
    <form className="space-y-6 w-full text-white" onSubmit={handleSubmit}>
      <div className="space-y-6 border-b border-white/10 pb-6">
        <div>
          <PageHeading heading="Settings" />
          <Description>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Deserunt
            odio totam incidunt ratione vero ex possimus cumque voluptatibus
            ipsa commodi doloribus dolorum ipsum, non aliquam earum aspernatur
            amet ab praesentium.
          </Description>
        </div>

        <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
          <div className="col-span-full">
            <div>
              <Label label="API key" htmlFor="api-key" required />
              <Description>
                Setup your Plainly API key to communicate directly with Plainly
                Videos. Your API key can be found in the{' '}
                <button
                  type="button"
                  className="underline text-white"
                  onClick={handleLinkClick.bind(
                    null,
                    'https://app.plainlyvideos.com/dashboard/user/settings/general',
                  )}
                >
                  Settings page
                </button>{' '}
                at Plainly.
              </Description>
            </div>
            <div className="mt-2 grid grid-cols-1">
              <input
                id="api-key"
                name="api-key"
                type={showApiKey ? 'text' : 'password'}
                className="col-start-1 row-start-1 block w-full rounded-md bg-white/5 pl-3 pr-10 py-1 text-xs text-white outline outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:pr-9"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowApiKey((prev) => !prev)}
                className="col-start-1 row-start-1 mr-3 self-center justify-self-end cursor-pointer w-4 h-4 flex items-center justify-center"
              >
                {showApiKey ? (
                  <EyeIcon className="size-4 shrink-0 text-gray-400" />
                ) : (
                  <EyeOffIcon className="size-4 shrink-0 text-gray-400" />
                )}
              </button>
            </div>
          </div>

          <div className="col-span-full">
            <div>
              <Label label="PIN (recommended)" htmlFor="pin" />
              <Description>
                Setup your four digit PIN to encrypt your API key stored on your
                device. You will be asked to enter this PIN on first request
                sent to Plainly every time you restart the extension. If you
                don&apos;t want to use a PIN, you can leave this field empty.
              </Description>
            </div>
            <div className="mt-2 grid grid-cols-6 items-center justify-items-center gap-y-2">
              <PINInput
                className="col-start-3 col-end-5 row-start-1"
                pin={pin}
                onChange={setPin}
              />
              <div className="col-start-3 col-end-5 row-start-2 flex items-center justify-center gap-x-1">
                <div className="bg-white/10 h-[1px] w-8" />
                <p className="text-xs text-gray-400">confirm</p>
                <div className="bg-white/10 h-[1px] w-8" />
              </div>
              <PINInput
                className="col-start-3 col-end-5 row-start-3"
                pin={confirmPin}
                onChange={setConfirmPin}
              />
            </div>
          </div>
        </div>
      </div>

      <Button
        className="float-right"
        disabled={loading || !apiKey}
        loading={loading}
      >
        Save
      </Button>

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

function PINInput({
  pin,
  onChange,
  className,
}: {
  pin: Pin;
  onChange: React.Dispatch<SetStateAction<Pin>>;
  className?: string;
}) {
  const changeDigit = useCallback(
    (
      digit: 'first' | 'second' | 'third' | 'fourth',
      value: string | undefined,
    ) => {
      onChange((prev) => ({ ...prev, [digit]: value }));
    },
    [onChange],
  );

  return (
    <div
      className={classNames('w-full flex gap-x-2 justify-center', className)}
    >
      <input
        id="pin"
        name="pin"
        type="password"
        pattern="[0-9]{1}"
        className="block w-[30px] rounded-md bg-white/5 px-3 py-1 text-xs text-white outline outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500"
        maxLength={1}
        value={pin.first}
        onChange={(e) => changeDigit('first', e.target.value)}
      />
      <input
        id="pin"
        name="pin"
        type="password"
        pattern="[0-9]{1}"
        maxLength={1}
        className="block w-[30px] rounded-md bg-white/5 px-3 py-1 text-xs text-white outline outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500"
        value={pin.second}
        onChange={(e) => changeDigit('second', e.target.value)}
      />
      <input
        id="pin"
        name="pin"
        type="password"
        pattern="[0-9]{1}"
        maxLength={1}
        className="block w-[30px] rounded-md bg-white/5 px-3 py-1 text-xs text-white outline outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500"
        value={pin.third}
        onChange={(e) => changeDigit('third', e.target.value)}
      />
      <input
        id="pin"
        name="pin"
        type="password"
        pattern="[0-9]{1}"
        maxLength={1}
        className="block w-[30px] rounded-md bg-white/5 px-3 py-1 text-xs text-white outline outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500"
        value={pin.fourth}
        onChange={(e) => changeDigit('fourth', e.target.value)}
      />
    </div>
  );
}
