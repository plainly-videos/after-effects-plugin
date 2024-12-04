import { BookText, GithubIcon, GlobeIcon } from 'lucide-react';

export default function Footer() {
  const handleLinkClick = (link: string) => {
    switch (link) {
      case 'learn':
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        cep.util.openURLInDefaultBrowser(
          'https://api.plainlyvideos.com/asciidoc/plainly-manual.html',
        );
        break;
      case 'github':
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        cep.util.openURLInDefaultBrowser(
          'https://github.com/plainly-videos/after-effects-plugin',
        );
        break;
      case 'plainly':
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        cep.util.openURLInDefaultBrowser('https://plainlyvideos.com');
        break;
    }
  };

  return (
    <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center text-white text-xs">
      <button
        type="button"
        className="flex items-center gap-2 hover:underline hover:underline-offset-4"
        onClick={handleLinkClick.bind(null, 'learn')}
      >
        <BookText size={16} />
        Learn
      </button>
      <button
        type="button"
        className="flex items-center gap-2 hover:underline hover:underline-offset-4"
        onClick={handleLinkClick.bind(null, 'github')}
      >
        <GithubIcon size={16} />
        Source code
      </button>
      <button
        type="button"
        className="flex items-center gap-2 hover:underline hover:underline-offset-4"
        onClick={handleLinkClick.bind(null, 'plainly')}
      >
        <GlobeIcon size={16} />
        plainlyvideos.com →
      </button>
    </footer>
  );
}
