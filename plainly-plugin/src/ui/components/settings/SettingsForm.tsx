import {
  useNavigate,
  useNotifications,
  useSessionStorage,
  useSettings,
} from '@src/ui/hooks';
import { Pin } from '@src/ui/types';
import {
  CircleCheckIcon,
  EyeIcon,
  EyeOffIcon,
  LoaderCircleIcon,
  XCircleIcon,
} from 'lucide-react';
import { useState } from 'react';
import { PinInput } from '.';
import { Button } from '../common';
import { Description, Label, PageHeading } from '../typography';

export function SettingsForm() {
  const { handleLinkClick } = useNavigate();
  const { notifySuccess, notifyError } = useNotifications();
  const {
    apiKeySet,
    apiKeyEncrypted,
    loading: settingsLoading,
    setSettingsApiKey,
    clearApiKey,
  } = useSettings();

  const [showApiKey, setShowApiKey] = useState(false);
  const [edit, setEdit] = useState(false);
  const [loading, setLoading] = useState(false);

  const [, , clearPinFromSessionStorage] = useSessionStorage('pin', undefined);
  const [apiKey, setApiKey] = useState<string>();
  const [pin, setPin] = useState<Pin>();
  const [confirmPin, setConfirmPin] = useState<Pin>();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (apiKey) {
      if (pin) {
        const pinClass = new Pin(pin.first, pin.second, pin.third, pin.fourth);
        if (!pinClass.isFilled()) {
          notifyError('All digits must be filled');
          setLoading(false);
          return;
        }

        if (!confirmPin) {
          notifyError('Please confirm your pin');
          setLoading(false);
          return;
        }

        const confirmPinClass = new Pin(
          confirmPin.first,
          confirmPin.second,
          confirmPin.third,
          confirmPin.fourth,
        );

        if (pinClass.getPin() !== confirmPinClass.getPin()) {
          notifyError('Pins do not match');
          setLoading(false);
          return;
        }
      }

      try {
        await setSettingsApiKey(apiKey, pin);
        notifySuccess('Settings saved successfully');
        setApiKey(undefined);
        if (pin) {
          setPin(undefined);
          setConfirmPin(undefined);
        }
        setEdit(false);
      } catch (error) {
        notifyError('Failed to save settings', (error as Error).message);
      } finally {
        setLoading(false);
      }
    }
  };

  const removeApiKey = async () => {
    setLoading(true);
    try {
      await clearApiKey();
      clearPinFromSessionStorage();
      notifySuccess('API key removed successfully');
    } catch (error) {
      notifyError('Failed to remove API key', (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="space-y-4 w-full text-white" onSubmit={handleSubmit}>
      <div className="space-y-4 border-b border-white/10 pb-4">
        <div>
          <PageHeading heading="Settings" />
          <Description className="mt-1">
            Configure your Plainly Videos plugin settings here.
          </Description>
        </div>

        {settingsLoading && (
          <LoaderCircleIcon className="animate-spin shrink-0 mx-auto size-6" />
        )}

        {!settingsLoading && (
          <div className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-6">
            <div className="col-span-full">
              <div>
                <Label label="API key" htmlFor="api-key" required />
                <Description>
                  Setup your Plainly Videos API key to communicate directly with
                  the Plainly app. Your API key can be found on the{' '}
                  <button
                    type="button"
                    className="underline text-white"
                    onClick={() =>
                      handleLinkClick(
                        'https://app.plainlyvideos.com/dashboard/user/settings/general',
                      )
                    }
                  >
                    Settings page
                  </button>
                  .
                </Description>
              </div>
              {(!apiKeySet || edit) && (
                <div className="mt-2 grid grid-cols-1">
                  <input
                    id="api-key"
                    name="api-key"
                    type={showApiKey ? 'text' : 'password'}
                    className="col-start-1 row-start-1 block w-full rounded-md bg-white/5 pl-3 pr-10 py-1 text-xs text-white outline outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500"
                    defaultValue={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    required
                  />
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
              )}
              {apiKeySet && !edit && (
                <div className="mt-2 flex flex-col gap-1">
                  <div className="flex items-center">
                    <CircleCheckIcon className="size-4 text-green-400" />
                    <p className="text-xs text-white ml-1">
                      Your API key is set
                    </p>
                  </div>
                  {apiKeyEncrypted === true && (
                    <div className="flex items-center">
                      <CircleCheckIcon className="size-4 text-green-400" />
                      <p className="text-xs text-white ml-1">
                        API key is protected with PIN
                      </p>
                    </div>
                  )}
                  {apiKeyEncrypted === false && (
                    <div className="flex items-center">
                      <XCircleIcon className="size-4 text-red-400" />
                      <p className="text-xs text-white ml-1">
                        API key is not protected
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {(!apiKeySet || edit) && (
              <div className="col-span-full">
                <div>
                  <Label label="PIN (recommended)" htmlFor="pin" />
                  <Description>
                    Add a PIN to protect your Plainly Videos API key. Otherwise,
                    the API key could be leaked to anyone using this computer.
                  </Description>
                </div>
                <div className="mt-2 grid grid-cols-6 items-center justify-items-center gap-y-2">
                  <PinInput
                    className="col-start-3 col-end-5 row-start-1"
                    pin={pin}
                    onChange={setPin}
                    type="text"
                  />
                  <div className="col-start-3 col-end-5 row-start-2 flex items-center justify-center gap-x-1">
                    <div className="bg-white/10 h-[1px] w-8" />
                    <p className="text-xs text-gray-400">confirm</p>
                    <div className="bg-white/10 h-[1px] w-8" />
                  </div>
                  <PinInput
                    className="col-start-3 col-end-5 row-start-3"
                    pin={confirmPin}
                    onChange={setConfirmPin}
                    type="text"
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {apiKeySet && !edit ? (
        <div className="float-right flex items-center gap-2">
          <Button type="button" onClick={() => setEdit(true)}>
            Edit
          </Button>
          <Button type="button" secondary onClick={removeApiKey}>
            Remove
          </Button>
        </div>
      ) : (
        <Button
          className="float-right"
          disabled={!apiKey || loading}
          loading={loading}
        >
          Save
        </Button>
      )}
    </form>
  );
}
