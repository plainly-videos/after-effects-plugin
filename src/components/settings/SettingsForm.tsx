import classNames from 'classnames';
import { CopyIcon, EyeIcon, EyeOffIcon } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNotification } from '../../hooks/useNotification';
import { useSessionStorage } from '../../hooks/useSessionStorage';
import { decode } from '../../node/encoding';
import { setSettingsApiKey } from '../../node/settings';
import { getSettings } from '../../node/settings';
import type { Pin } from '../../types';
import { handleLinkClick } from '../../utils';
import Button from '../common/Button';
import Notification from '../common/Notification';
import Description from '../typography/Description';
import Label from '../typography/Label';
import PageHeading from '../typography/PageHeading';

export default function SettingsForm() {
  const [showApiKey, setShowApiKey] = useState(false);
  const [showPin, setShowPin] = useState(false);

  const [loading, setLoading] = useState(false);
  const { notification, notifySuccess, notifyError, clearNotification } =
    useNotification();
  const { setItem, getItem } = useSessionStorage();

  const [apiKey, setApiKey] = useState<string>();
  const [pin, setPin] = useState<Pin>();
  const [confirmPin, setConfirmPin] = useState<Pin>();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (apiKey) {
      if (pin && Object.values(pin).some((value) => !value)) {
        notifyError('All digits must be filled');
        setLoading(false);
        return;
      }

      if (pin && JSON.stringify(pin) !== JSON.stringify(confirmPin)) {
        notifyError('Pins do not match');
        setLoading(false);
        return;
      }

      try {
        await setSettingsApiKey(apiKey, pin);
        notifySuccess('Settings saved successfully');
        if (pin) {
          setItem('pin', JSON.stringify(pin));
          setPin(undefined);
          setConfirmPin(undefined);
        }
        setLoading(false);
      } catch (error) {
        notifyError('Failed to save settings', (error as Error).message);
        setLoading(false);
        setPin(undefined);
        setConfirmPin(undefined);
      }
    }
  };

  useEffect(() => {
    const getApiKey = async () => {
      const settings = await getSettings();
      let apiKey = settings.apiKey;

      if (apiKey && settings.hasPin && getItem('pin')) {
        const pin = getItem('pin') as string;
        const parsedPin = JSON.parse(pin);
        const secret = `${parsedPin.first}${parsedPin.second}${parsedPin.third}${parsedPin.fourth}`;

        apiKey = decode(secret, apiKey);
      }

      setApiKey(apiKey);
    };

    getApiKey();
  }, [getItem]);

  return (
    <form className="space-y-6 w-full text-white" onSubmit={handleSubmit}>
      <div className="space-y-6 border-b border-white/10 pb-6">
        <div>
          <PageHeading heading="Settings" />
          <Description className="mt-1">
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
                className="col-start-1 row-start-1 block w-full rounded-md bg-white/5 pl-3 pr-16 py-1 text-xs text-white outline outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(apiKey || '');
                  notifySuccess('API key copied to clipboard');
                }}
                className="col-start-1 row-start-1 mr-9 self-center justify-self-end cursor-pointer w-4 h-4 flex items-center justify-center group"
              >
                <CopyIcon className="size-4 shrink-0 text-gray-400 group-hover:text-white" />
              </button>
              <button
                type="button"
                onClick={() => setShowApiKey((prev) => !prev)}
                className="col-start-1 row-start-1 mr-3 self-center justify-self-end cursor-pointer w-4 h-4 flex items-center justify-center group"
              >
                {showApiKey ? (
                  <EyeIcon className="size-4 shrink-0 text-gray-400 group-hover:text-white" />
                ) : (
                  <EyeOffIcon className="size-4 shrink-0 text-gray-400 group-hover:text-white" />
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
              <PinInput
                className="col-start-3 col-end-5 row-start-1"
                pin={pin}
                showPin={showPin}
                onChange={setPin}
              />
              <div className="col-start-3 col-end-5 row-start-2 flex items-center justify-center gap-x-1">
                <div className="bg-white/10 h-[1px] w-8" />
                <button
                  type="button"
                  onClick={() => setShowPin((prev) => !prev)}
                  className="cursor-pointer w-4 h-4 flex items-center justify-center group mx-3"
                >
                  {showPin ? (
                    <EyeIcon className="size-4 shrink-0 text-gray-400 group-hover:text-white" />
                  ) : (
                    <EyeOffIcon className="size-4 shrink-0 text-gray-400 group-hover:text-white" />
                  )}
                </button>
                <div className="bg-white/10 h-[1px] w-8" />
              </div>
              <PinInput
                className="col-start-3 col-end-5 row-start-3"
                pin={confirmPin}
                showPin={showPin}
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

export function PinInput({
  pin,
  onChange,
  showPin,
  className,
}: {
  pin: Pin | undefined;
  onChange: (pin: Pin) => void;
  showPin?: boolean;
  className?: string;
}) {
  // Create refs for each input
  const firstInputRef = useRef<HTMLInputElement>(null);
  const secondInputRef = useRef<HTMLInputElement>(null);
  const thirdInputRef = useRef<HTMLInputElement>(null);
  const fourthInputRef = useRef<HTMLInputElement>(null);

  const changeDigit = useCallback(
    (
      digit: 'first' | 'second' | 'third' | 'fourth',
      value: string | undefined,
    ) => {
      const parsedValue = value ? Number.parseInt(value) : undefined;

      onChange({
        ...pin,
        first: digit === 'first' ? parsedValue : pin?.first,
        second: digit === 'second' ? parsedValue : pin?.second,
        third: digit === 'third' ? parsedValue : pin?.third,
        fourth: digit === 'fourth' ? parsedValue : pin?.fourth,
      } as Pin);

      // Move focus to the next input if a valid digit is entered
      if (value && value.length === 1) {
        switch (digit) {
          case 'first':
            secondInputRef.current?.focus();
            break;
          case 'second':
            thirdInputRef.current?.focus();
            break;
          case 'third':
            fourthInputRef.current?.focus();
            break;
          default:
            break;
        }
      }
    },
    [pin, onChange],
  );

  return (
    <div
      className={classNames('w-full flex gap-x-2 justify-center', className)}
    >
      <input
        ref={firstInputRef}
        id="pin-first"
        name="pin"
        type={showPin ? 'text' : 'password'}
        pattern="[0-9]{1}"
        className="block w-8 text-center rounded-md bg-white/5 px-3 py-1 text-xs text-white outline outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500"
        maxLength={1}
        value={pin?.first || ''}
        onChange={(e) => changeDigit('first', e.target.value)}
      />
      <input
        ref={secondInputRef}
        id="pin-second"
        name="pin"
        type={showPin ? 'text' : 'password'}
        pattern="[0-9]{1}"
        maxLength={1}
        className="block w-8 text-center rounded-md bg-white/5 px-3 py-1 text-xs text-white outline outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500"
        value={pin?.second || ''}
        onChange={(e) => changeDigit('second', e.target.value)}
      />
      <input
        ref={thirdInputRef}
        id="pin-third"
        name="pin"
        type={showPin ? 'text' : 'password'}
        pattern="[0-9]{1}"
        maxLength={1}
        className="block w-8 text-center rounded-md bg-white/5 px-3 py-1 text-xs text-white outline outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500"
        value={pin?.third || ''}
        onChange={(e) => changeDigit('third', e.target.value)}
      />
      <input
        ref={fourthInputRef}
        id="pin-fourth"
        name="pin"
        type={showPin ? 'text' : 'password'}
        pattern="[0-9]{1}"
        maxLength={1}
        className="block w-8 text-center rounded-md bg-white/5 px-3 py-1 text-xs text-white outline outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500"
        value={pin?.fourth || ''}
        onChange={(e) => changeDigit('fourth', e.target.value)}
      />
    </div>
  );
}
