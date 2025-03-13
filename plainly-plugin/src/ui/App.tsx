import { isDev, pluginBundleVersion } from '@src/env';
import { useEffect, useMemo, useState } from 'react';
import {
  Button,
  Checkbox,
  ConfirmationDialog,
  ExternalLink,
  Sidebar,
} from './components';
import { useGetLatestGithubRelease, useSettings } from './hooks';
import {
  AboutRoute,
  ExportRoute,
  ProjectsRoute,
  SettingsRoute,
  UploadRoute,
} from './routes';
import { State, useGlobalState } from './state/store';
import { handleLinkClick, reloadExtension } from './utils';

export function App() {
  const [showNewVersionModal, setShowNewVersionModal] = useState<boolean>();
  const [doNotShowAgain, setDoNotShowAgain] = useState(false);

  const { showUpdate, setShowUpdate } = useSettings();
  const [settings] = useGlobalState(State.SETTINGS);
  const currentPage = settings.currentPage;
  const { data } = useGetLatestGithubRelease(!!showUpdate);

  const latestReleaseVersion = data?.tag_name.replace('v', '');
  const newVersionAvailable = pluginBundleVersion !== latestReleaseVersion;
  const showModal =
    data &&
    showUpdate !== false &&
    newVersionAvailable &&
    showNewVersionModal !== false;

  // Add new pages here and to pages.ts
  const route = useMemo(() => {
    if (currentPage === '/export') return <ExportRoute />;
    if (currentPage === '/upload') return <UploadRoute />;
    if (currentPage === '/projects') return <ProjectsRoute />;
    if (currentPage === '/settings') return <SettingsRoute />;
    if (currentPage === '/about') return <AboutRoute />;

    return null;
  }, [currentPage]);

  useEffect(() => {
    if (showNewVersionModal === false) {
      setShowUpdate(!doNotShowAgain);
    }
  }, [showNewVersionModal, setShowUpdate, doNotShowAgain]);

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
      <ConfirmationDialog
        open={!!showModal}
        setOpen={setShowNewVersionModal}
        title="New version available"
        description={
          <>
            A new version of the extension is available! Updating ensures you
            get the latest features, performance improvements, and critical bug
            fixes. Check out what's new in the{' '}
            <ExternalLink
              to={`https://github.com/plainly-videos/after-effects-plugin/releases/tag/${data?.tag_name}`}
              text="latest changelog"
            />{' '}
            and update now to stay up to date!
          </>
        }
        buttonText="Update now"
        action={handleLinkClick.bind(
          null,
          'https://exchange.adobe.com/apps/cc/202811/plainly-videos',
        )}
        type="info"
      >
        <Checkbox
          label="Don't show again"
          description="Disabling this notification means you won't be reminded about plugin updates in the future."
          onChange={setDoNotShowAgain}
          className="text-left"
        />
      </ConfirmationDialog>
    </>
  );
}
