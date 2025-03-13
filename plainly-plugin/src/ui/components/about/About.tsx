import { useGetLatestGithubRelease } from '@src/ui/hooks';
import classNames from 'classnames';
import { pluginBundleVersion } from '../../../env';
import { handleLinkClick } from '../../utils';
import { Alert, ExternalLink } from '../common';
import { Description, Label, PageHeading } from '../typography';

export function About() {
  const { data } = useGetLatestGithubRelease();

  const latestReleaseVersion = data?.tag_name.replace('v', '');
  const newVersionAvailable = pluginBundleVersion !== latestReleaseVersion;

  const pluginBasics = [
    { label: 'Name', value: 'Plainly Videos Plugin' },
    { label: 'Version', value: `${pluginBundleVersion}` },
    { label: 'Author', value: 'contact@plainlyvideos.com' },
    { label: 'License', value: 'Apache-2.0' },
    {
      label: 'Source code',
      value: 'GitHub',
      link: 'https://github.com/plainly-videos/after-effects-plugin',
    },
    {
      label: 'Website',
      value: 'plainlyvideos.com',
      link: 'https://plainlyvideos.com',
    },
  ];

  const pluginFeatures = [
    {
      label: 'Export zip',
      version: '1.0.0',
    },
    {
      label: 'Upload project',
      version: '1.1.0',
    },
    {
      label: 'Projects list',
      version: '1.2.0',
    },
  ];

  return (
    <div className="space-y-4 w-full text-white">
      <div>
        <PageHeading heading="About" />
        <Description className="mt-1">
          This plugin is a tool developed by{' '}
          <button
            type="button"
            className="underline text-white"
            onClick={handleLinkClick.bind(null, 'https://plainlyvideos.com')}
          >
            Plainly Videos,
          </button>{' '}
          a leading platform for automated video production. This plugin helps
          Plainly users to collaborate with the platform more efficiently and
          more easily. To get the most out of the plugin, you can{' '}
          <button
            type="button"
            className="underline text-white"
            onClick={handleLinkClick.bind(
              null,
              'https://app.plainlyvideos.com/sign-up',
            )}
          >
            sign up
          </button>{' '}
          at Plainly.
        </Description>
      </div>
      {newVersionAvailable && data && (
        <Alert
          type="info"
          title={
            <>
              A new version of the extension is available! Updating ensures you
              get the latest features, performance improvements, and critical
              bug fixes. Check out what's new in the{' '}
              <ExternalLink
                to={`https://github.com/plainly-videos/after-effects-plugin/releases/tag/v${data.tag_name}`}
                text="latest changelog"
              />{' '}
              and{' '}
              <ExternalLink
                to="https://exchange.adobe.com/apps/cc/202811/plainly-videos"
                text="update now"
              />{' '}
              to stay up to date!
            </>
          }
        />
      )}
      <div>
        <Label label="Plugin basics" />
        <div className="grid grid-cols-3 border-t border-l border-r border-white/10 text-xs mt-2">
          <div className="col-span-1 font-medium border-r border-white/10">
            {pluginBasics.map(({ label }) => (
              <p
                className="bg-[rgb(43,43,43)] px-1 py-1 border-b border-white/10"
                key={label}
              >
                {label}
              </p>
            ))}
          </div>

          <div className="col-span-2">
            {pluginBasics.map(({ value, link }) => (
              <button
                type="button"
                className={classNames(
                  'px-1 py-1 border-b border-white/10 w-full text-left',
                  link ? 'cursor-pointer underline' : 'cursor-default',
                )}
                key={value}
                onClick={handleLinkClick.bind(null, link)}
              >
                {value}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div>
        <Label label="Plugin features" />
        <div className="grid grid-cols-3 border-t border-l border-r border-white/10 text-xs mt-2">
          <div className="col-span-3 grid grid-cols-3 bg-[rgb(43,43,43)] divide-x divide-white/10">
            <p className="px-1 py-1">Name</p>
            <p className="px-1 py-1">Since version</p>
          </div>
          <div className="col-span-3 grid grid-cols-3">
            {pluginFeatures.map(({ label, version }) => (
              <div
                className="col-span-3 grid grid-cols-3 divide-x divide-white/10 border-b border-white/10"
                key={label}
              >
                <p className="px-1 py-1">{label}</p>
                <p className="px-1 py-1">{version}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
