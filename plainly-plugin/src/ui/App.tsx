import { isDev, pluginBundleVersion } from '@src/env';
import { useMemo } from 'react';
import {
  Button,
  ExternalLink,
  NoticeBanner,
  Sidebar,
  UiProvider,
} from './components';
import { useGetLatestGithubRelease, useNavigate } from './hooks';
import {
  AboutRoute,
  ExportRoute,
  ProjectsRoute,
  SettingsRoute,
  UploadRoute,
} from './routes';
import { reloadExtension } from './utils';

export function App() {
  const { currentPage } = useNavigate();
  const { data } = useGetLatestGithubRelease();

  const latestReleaseVersion = data?.tag_name.replace('v', '');
  const newVersionAvailable = pluginBundleVersion !== latestReleaseVersion;
  const showBanner = !!data && newVersionAvailable;

  // Add new pages here and to pages.ts
  const route = useMemo(() => {
    if (currentPage === '/export') return <ExportRoute />;
    if (currentPage === '/upload') return <UploadRoute />;
    if (currentPage === '/projects') return <ProjectsRoute />;
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
      <UiProvider props={{ hasBanner: showBanner }}>{route}</UiProvider>
      <NoticeBanner show={showBanner}>
        <p className="text-white text-xs font-medium">
          New version is out! Read{' '}
          <ExternalLink
            to={`https://github.com/plainly-videos/after-effects-plugin/releases/tag/${data?.tag_name}`}
            text="what's new"
          />{' '}
          and{' '}
          <ExternalLink
            to="https://exchange.adobe.com/apps/cc/202811/plainly-videos"
            text="upgrade"
          />
          .
        </p>
      </NoticeBanner>
    </>
  );
}
