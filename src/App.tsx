import { useMemo } from 'react';
import Button from './components/common/Button';
import Sidebar from './components/navigation/Sidebar';
import { isProd } from './env';
import About from './routes/About';
import Export from './routes/Export';
import Outlet from './routes/Outlet';
import { State, useGlobalState } from './state/store';
import { reloadExtension } from './utils';

export default function App() {
  const [settings] = useGlobalState(State.SETTINGS);
  const currentPage = settings.currentPage;

  // Add new pages here and to pages.ts
  const children = useMemo(() => {
    if (currentPage === '/export') return <Export />;
    if (currentPage === '/about') return <About />;

    return null;
  }, [currentPage]);

  return (
    <>
      {!isProd && (
        <Button
          secondary
          onClick={reloadExtension}
          className="absolute top-3 right-3 cursor-pointer"
        >
          Reload extension
        </Button>
      )}
      <Sidebar />
      <Outlet>{children}</Outlet>
    </>
  );
}
