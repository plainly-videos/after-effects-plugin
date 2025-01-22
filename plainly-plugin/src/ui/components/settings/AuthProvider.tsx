import { LoaderCircleIcon } from 'lucide-react';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { useNotification } from '../../hooks/useNotification';
import { useSessionStorage } from '../../hooks/useSessionStorage';
import { useSettings } from '../../hooks/useSettings';
import Notification from '../common/Notification';
import PinOverlay from './PinOverlay';

interface AuthContextProps {
  apiKey: string | undefined;
  decryptedKey: string | undefined;
  setDecryptedKey: React.Dispatch<React.SetStateAction<string | undefined>>;
  decryptKey: (pin: string) => void;
  cancelDecrypt: () => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { settings, getSettingsApiKey, loading } = useSettings();
  const { notification, notifySuccess, notifyError, clear } = useNotification();

  const [storedValue, setValue] = useSessionStorage<string>('pin', '');
  const [decryptedKey, setDecryptedKey] = useState<string>();

  const decryptKey = useCallback(
    (pin: string) => {
      const { key, error } = getSettingsApiKey(true, pin);

      if (error) {
        notifyError(error);
        return;
      }

      setValue(pin);
      setDecryptedKey(key);
      notifySuccess('Successfully entered PIN');
    },
    [getSettingsApiKey, notifyError, notifySuccess, setValue],
  );

  const cancelDecrypt = useCallback(() => {
    setDecryptedKey(settings.apiKey?.key);
    setValue('cancelled');
  }, [setValue, settings.apiKey?.key]);

  const showOverlay =
    (!decryptedKey || !storedValue) && settings.apiKey?.encrypted;

  return (
    <AuthContext.Provider
      value={{
        apiKey: settings.apiKey?.key,
        decryptedKey,
        setDecryptedKey,
        decryptKey,
        cancelDecrypt,
      }}
    >
      {loading ? (
        <LoaderCircleIcon className="animate-spin shrink-0 mx-auto size-6 text-white my-auto" />
      ) : (
        <>
          {showOverlay ? <PinOverlay /> : children}
          {notification && (
            <Notification
              title={notification.title}
              type={notification.type}
              description={notification.description}
              onClose={clear}
            />
          )}
        </>
      )}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('usePinContext must be used within a AuthProvider');
  }

  return context;
};
