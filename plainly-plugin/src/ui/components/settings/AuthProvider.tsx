import { LoaderCircleIcon } from 'lucide-react';
import { createContext } from 'react';
import { useSessionStorage } from '../../hooks/useSessionStorage';
import { useSettings } from '../../hooks/useSettings';
import MissingApiKey from './MissingApiKey';
import PinOverlay from './PinOverlay';

interface AuthContextProps {
  apiKey: string;
}

export const AuthContext = createContext<AuthContextProps>(
  {} as AuthContextProps,
);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { getSettingsApiKey, loading } = useSettings();

  const [pin, setPinStorage] = useSessionStorage<string | undefined>(
    'pin',
    undefined,
  );

  const { key, encrypted, error } = getSettingsApiKey(pin);
  const showOverlay = (!pin && encrypted) || error;

  return (
    <>
      {loading ? (
        <LoaderCircleIcon className="animate-spin shrink-0 mx-auto size-6 text-white my-auto" />
      ) : (
        <>
          {!key && !error && <MissingApiKey />}
          {showOverlay && <PinOverlay setPinStorage={setPinStorage} />}
          {key && !showOverlay && (
            <AuthContext.Provider value={{ apiKey: key }}>
              {children}
            </AuthContext.Provider>
          )}
        </>
      )}
    </>
  );
};
