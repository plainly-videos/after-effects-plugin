import { isDev } from '@src/env';
import { useMemo } from 'react';
import { Button, Sidebar } from './components';
import { useNavigate } from './hooks';
import {
  AboutRoute,
  ExportRoute,
  ProjectRoute,
  ProjectsRoute,
  SettingsRoute,
  UploadRoute,
} from './routes';
import { extractIdFromPage, reloadExtension } from './utils';

export function App() {
  const { currentPage } = useNavigate();

  // Add new pages here and to pages.ts
  const route = useMemo(() => {
    if (currentPage === '/export') return <ExportRoute />;
    if (currentPage === '/upload') return <UploadRoute />;

    if (currentPage === '/projects') return <ProjectsRoute />;
    if (currentPage.startsWith('/projects/')) {
      return <ProjectRoute id={extractIdFromPage(currentPage)} />;
    }

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
      {route}
    </>
  );
}
