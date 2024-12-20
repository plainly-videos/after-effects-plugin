import { useEffect, useMemo, useState } from 'react';
import Button from './components/common/Button';
import Sidebar from './components/navigation/Sidebar';
import PinOverlay from './components/settings/PinOverlay';
import { isDev } from './env';
import { useSessionStorage } from './hooks/useSessionStorage';
import { getSettings } from './node/settings';
import AboutRoute from './routes/AboutRoute';
import ExportRoute from './routes/ExportRoute';
import SettingsRoute from './routes/SettingsRoute';
import { State, useGlobalState } from './state/store';
import { reloadExtension } from './utils';

export default function App() {
  const [settings] = useGlobalState(State.SETTINGS);
  const currentPage = settings.currentPage;

  // Add new pages here and to pages.ts
  const children = useMemo(() => {
    if (currentPage === '/export') return <ExportRoute />;
    if (currentPage === '/about') return <AboutRoute />;
    if (currentPage === '/settings') return <SettingsRoute />;

    return null;
  }, [currentPage]);

  const [showPinOverlay, setShowPinOverlay] = useState(false);
  const { getItem } = useSessionStorage();

  useEffect(() => {
    const getUserSettings = async () => {
      const settings = await getSettings();
      if (settings.hasPin && !getItem('pin')) setShowPinOverlay(true);
    };

    getUserSettings();
  }, [getItem]);

  return (
    <>
      {isDev && (
        <Button
          secondary
          onClick={reloadExtension}
          className="absolute top-3 right-3 cursor-pointer z-40"
        >
          Reload extension
        </Button>
      )}
      {showPinOverlay && <PinOverlay close={() => setShowPinOverlay(false)} />}
      <Sidebar />
      {children}
    </>
  );
}
