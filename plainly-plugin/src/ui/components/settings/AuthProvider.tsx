import {
  useNotifications,
  useSessionStorage,
  useSettings,
} from '@src/ui/hooks';
import { LoaderCircleIcon } from 'lucide-react';
import { createContext, useCallback } from 'react';
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

  const [pin, setPinStorage] = useSessionStorage<string | undefined>(
    'pin',
    undefined,
  );

  const onPinSubmitted = useCallback(
    (pin: string | undefined) => {
      try {
        getSettingsApiKey(pin);
        setPinStorage(pin);
      } catch (error) {
        notifyError((error as Error).message);
        return;
      }
    },
    [getSettingsApiKey, notifyError, setPinStorage],
  );

  const showOverlay = apiKeyEncrypted && !pin;

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
              {!showOverlay && (
                <AuthContext.Provider
                  value={{ apiKey: getSettingsApiKey(pin) }}
                >
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
