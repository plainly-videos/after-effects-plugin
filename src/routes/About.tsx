import classNames from 'classnames';
import MainWrapper from '../components/layout/MainWrapper';
import PlainlyLogo from '../components/logo/PlainlyLogo';
import { pluginBundleVersion } from '../env';
import { handleLinkClick } from '../utils';

export default function About() {
  const applicationBasics = [
    { label: 'Name', value: 'Plainly plugin' },
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

  const applicationFeatures = [
    {
      label: 'Export zip',
      version: '1.0.0',
    },
  ];

  return (
    <MainWrapper>
      <div className="space-y-6 w-full text-white">
        <div className="space-y-6">
          <PlainlyLogo className="h-10" />
          <p className="text-xs text-gray-400">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Obcaecati
            hic cum sit magni nemo, provident, quam omnis recusandae ea dolor
            vel aliquam dolore dicta repudiandae totam maiores asperiores.
            Voluptatibus, placeat!
          </p>
        </div>
        <div>
          <h3 className="text-sm/7 font-medium">Application basics</h3>
          <div className="grid grid-cols-3 border-t border-l border-r border-white/10 text-xs">
            <div className="col-span-1 font-medium border-r border-white/10">
              {applicationBasics.map(({ label }) => (
                <p
                  className="bg-[rgb(43,43,43)] px-1 py-1 border-b border-white/10"
                  key={label}
                >
                  {label}
                </p>
              ))}
            </div>

            <div className="col-span-2">
              {applicationBasics.map(({ value, link }) => (
                <button
                  type="button"
                  className={classNames(
                    'px-1 py-1 border-b border-white/10 w-full text-left',
                    link && 'cursor-pointer underline',
                  )}
                  key={value}
                  onClick={() => link && handleLinkClick.bind(null, link)}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-sm/7 font-medium">Plugin features</h3>
          <div className="grid grid-cols-3 border-t border-l border-r border-white/10 text-xs">
            <div className="col-span-3 grid grid-cols-3 bg-[rgb(43,43,43)] divide-x divide-white/10">
              <p className="px-1 py-1">Name</p>
              <p className="px-1 py-1">Version</p>
            </div>
            <div className="col-span-3 grid grid-cols-3">
              {applicationFeatures.map(({ label, version }) => (
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
    </MainWrapper>
  );
}
