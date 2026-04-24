import {
  useNotifications,
  useSessionStorage,
  useSettings,
} from '@src/ui/hooks';
import { LoaderCircleIcon } from 'lucide-react';
import { createContext, useCallback, useEffect } from 'react';
import { MissingApiKey, PinOverlay } from '.';

interface AuthContextProps {
  apiKey: string;
}

export const AuthContext = createContext<AuthContextProps>(
  {} as AuthContextProps,
);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { apiKeySet, apiKeyEncrypted, getSettingsApiKey, loading } =
    useSettings();
  const { notifyError } = useNotifications();

  const [pin, setPinStorage, clearPinStorage] = useSessionStorage<
    string | undefined
  >('pin', undefined);

  const onPinSubmitted = useCallback(
    (pin: string | undefined) => {
      try {
        getSettingsApiKey(pin);
        setPinStorage(pin);
      } catch (error) {
        notifyError('There was an issue with setting the PIN.', error);
        return;
      }
    },
    [getSettingsApiKey, notifyError, setPinStorage],
  );

  // Try to decode BEFORE returning JSX. Don't throw, just track failure.
  let decryptedApiKey: string | undefined;
  let pinInvalid = false;
  if (apiKeySet && (!apiKeyEncrypted || pin)) {
    try {
      decryptedApiKey = getSettingsApiKey(pin);
    } catch {
      pinInvalid = true;
    }
  }

  // If decode failed, clear the PIN on the next tick.
  // This triggers a re-render where `pin` is now `undefined`, showing the overlay again.
  useEffect(() => {
    if (pinInvalid) clearPinStorage();
  }, [clearPinStorage, pinInvalid]);

  const showOverlay = apiKeyEncrypted && (!pin || pinInvalid);

  return (
    <>
      {loading ? (
        <LoaderCircleIcon className="animate-spin shrink-0 mx-auto size-6 text-white my-auto" />
      ) : (
        <>
          {!apiKeySet && <MissingApiKey />}
          {apiKeySet && (
            <>
              {showOverlay && <PinOverlay onPinSubmitted={onPinSubmitted} />}
              {!showOverlay && decryptedApiKey && (
                <AuthContext.Provider value={{ apiKey: decryptedApiKey }}>
                  {children}
                </AuthContext.Provider>
              )}
            </>
          )}
        </>
      )}
    </>
  );
};
