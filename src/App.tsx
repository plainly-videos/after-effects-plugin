import { useMemo } from 'react';
import Button from './components/common/Button';
import Sidebar from './components/navigation/Sidebar';
import { isDev } from './env';
import AboutRoute from './routes/AboutRoute';
import ExportRoute from './routes/ExportRoute';
import { State, useGlobalState } from './state/store';
import { reloadExtension } from './utils';

export default function App() {
  const [settings] = useGlobalState(State.SETTINGS);
  const currentPage = settings.currentPage;

  // Add new pages here and to pages.ts
  const children = useMemo(() => {
    if (currentPage === '/export') return <ExportRoute />;
    if (currentPage === '/about') return <AboutRoute />;

    return null;
  }, [currentPage]);

  return (
    <>
      {isDev && (
        <Button
          secondary
          onClick={reloadExtension}
          className="absolute top-3 right-3 cursor-pointer z-30"
        >
          Reload extension
        </Button>
      )}
      <Sidebar />
      {children}
    </>
  );
}
