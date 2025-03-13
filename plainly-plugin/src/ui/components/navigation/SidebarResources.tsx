import { pluginBundleVersion } from '@src/env';
import { useGetLatestGithubRelease } from '@src/ui/hooks';
import { resources } from '@src/ui/routes';
import { SidebarLinks } from '.';

export function SidebarResources() {
  const { data } = useGetLatestGithubRelease();

  const latestReleaseVersion = data?.tag_name.replace('v', '');
  const newVersionAvailable = pluginBundleVersion !== latestReleaseVersion;

  for (const resourcesLink of resources) {
    if (resourcesLink.name === 'About' && newVersionAvailable) {
      resourcesLink.notification = true;
    }
  }

  return <SidebarLinks links={resources} />;
}
