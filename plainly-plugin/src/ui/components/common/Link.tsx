import { useNavigate } from '@src/ui/hooks';
import type { Routes } from '@src/ui/types';
import { handleLinkClick } from '@src/ui/utils';

export function Link({ text, onClick }: { text: string; onClick: () => void }) {
  return (
    <button
      type="button"
      className="underline text-white whitespace-nowrap"
      onClick={onClick}
    >
      {text}
    </button>
  );
}

export function ExternalLink({ to, text }: { to: string; text: string }) {
  return <Link text={text} onClick={handleLinkClick.bind(null, to)} />;
}

export function InternalLink({ to, text }: { to: Routes; text: string }) {
  const { navigate } = useNavigate();
  return <Link onClick={() => navigate(to)} text={text} />;
}
