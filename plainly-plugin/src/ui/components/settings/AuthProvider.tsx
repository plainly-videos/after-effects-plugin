import {
  useNotifications,
  useSessionStorage,
  useSettings,
} from '@src/ui/hooks';
import { createContext, useCallback, useEffect } from 'react';
import { Loading } from '../common';
import { MissingApiKey, PinOverlay } from '.';

interface AuthContextProps {
  apiKey: string;
}

export const AuthContext = createContext<AuthContextProps>(
  {} as AuthContextProps,
);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const {
    apiKeySet,
    apiKeyEncrypted: apiKeyLocked,
    getSettingsApiKey,
    loading,
  } = useSettings();
  const { notifyError } = useNotifications();

  const [pin, setPin, clearPin] = useSessionStorage<string | undefined>(
    'pin',
    undefined,
  );

  const tryUnlock = useCallback(
    (pin: string | undefined): { apiKey?: string; error?: unknown } => {
      try {
        return { apiKey: getSettingsApiKey(pin) };
      } catch (error) {
        return { error };
      }
    },
    [getSettingsApiKey],
  );

  const onPinSubmitted = useCallback(
    (submittedPin: string | undefined) => {
      const { error } = tryUnlock(submittedPin);
      if (error) {
        notifyError('Failed to unlock with the provided PIN.', error);
        return;
      }
      setPin(submittedPin);
    },
    [tryUnlock, notifyError, setPin],
  );

  // A stored PIN is "rejected" if it fails to unlock (wrong PIN, or stale PIN
  // from when the key was still locked). The effect below clears it so the
  // overlay re-appears.
  const pinRejected = apiKeySet && !!pin && !!tryUnlock(pin).error;

  useEffect(() => {
    if (pinRejected) clearPin();
  }, [clearPin, pinRejected]);

  const showPinOverlay = apiKeyLocked && (!pin || pinRejected);

  if (loading) return <Loading />;
  if (!apiKeySet) return <MissingApiKey />;
  if (showPinOverlay) return <PinOverlay onPinSubmitted={onPinSubmitted} />;

  // Past the gates: key is set, and either it's not locked or we have a
  // verified PIN. Decoding here cannot fail.
  const apiKey = getSettingsApiKey(apiKeyLocked ? pin : undefined);

  return (
    <AuthContext.Provider value={{ apiKey }}>{children}</AuthContext.Provider>
  );
};
