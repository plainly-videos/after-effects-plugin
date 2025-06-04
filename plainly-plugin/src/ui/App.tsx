import { isDev, pluginBundleVersion } from '@src/env';
import { evalScriptAsync } from '@src/node/utils';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Banner,
  Button,
  ConfirmationDialog,
  ExternalLink,
  Sidebar,
} from './components';
import { useGetLatestGithubRelease, useNavigate } from './hooks';
import {
  AboutRoute,
  ExportRoute,
  ProjectsRoute,
  SettingsRoute,
  UploadRoute,
} from './routes';
import { State, getGlobalState, setGlobalState } from './state/store';
import { reloadExtension } from './utils';

export function App() {
  const { currentPage } = useNavigate();
  const { data } = useGetLatestGithubRelease();

  const [projectChanged, setProjectChanged] = useState(false);
  const [dismissedReload, setDismissedReload] = useState(false);

  const settings = getGlobalState(State.SETTINGS);
  const { documentId } = settings;

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

  const handleDialogClose = useCallback(() => {
    setProjectChanged(false);
    setDismissedReload(true);
  }, []);

  useEffect(() => {
    const interval = setInterval(async () => {
      const data = await evalScriptAsync('getProjectBasicData()');
      if (data) {
        const parsedData: { documentId: string | undefined } = JSON.parse(data);
        if (
          documentId &&
          !dismissedReload &&
          parsedData.documentId !== documentId
        ) {
          setProjectChanged(true);
        } else {
          setDismissedReload(false);
          setGlobalState(State.SETTINGS, {
            ...settings,
            documentId: parsedData.documentId || '',
          });
        }
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [settings, documentId, dismissedReload]);

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden">
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
      <Banner show={showBanner}>
        <p className="text-white text-xs font-medium">
          A new version is available! 🚀 See{' '}
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
      </Banner>

      <div className="flex-1 overflow-y-auto">
        {route}
        <ConfirmationDialog
          title="Working project changed."
          description="We have detected that the project you are working on has changed. We recommend reloading the extension to ensure everything works correctly."
          buttonText="Reload"
          open={projectChanged}
          setOpen={setProjectChanged}
          action={reloadExtension}
          onClose={handleDialogClose}
        />
      </div>
    </div>
  );
}
