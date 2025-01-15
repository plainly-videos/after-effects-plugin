import { useMemo } from 'react';
import { isDev } from '../env';
import Button from './components/common/Button';
import Sidebar from './components/navigation/Sidebar';
import AboutRoute from './routes/AboutRoute';
import ExportRoute from './routes/ExportRoute';
import SettingsRoute from './routes/SettingsRoute';
import UploadRoute from './routes/UploadRoute';
import { State, useGlobalState } from './state/store';
import { reloadExtension } from './utils';

export default function App() {
  const [settings] = useGlobalState(State.SETTINGS);
  const currentPage = settings.currentPage;

  // Add new pages here and to pages.ts
  const children = useMemo(() => {
    if (currentPage === '/export') return <ExportRoute />;
    if (currentPage === '/upload') return <UploadRoute />;
    if (currentPage === '/settings') return <SettingsRoute />;
    if (currentPage === '/about') return <AboutRoute />;

    return null;
  }, [currentPage]);

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
      <Sidebar />
      {children}
    </>
  );
}
