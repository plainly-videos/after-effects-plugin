import { useNavigate } from '@src/ui/hooks';
import type { Routes } from '@src/ui/types';
import classNames from 'classnames';

export function Link({
  text,
  onClick,
  noUnderline,
}: { text: string; onClick: () => void; noUnderline?: boolean }) {
  return (
    <button
      type="button"
      className={classNames(
        'text-white whitespace-nowrap',
        noUnderline ? '' : 'underline',
      )}
      onClick={onClick}
    >
      {text}
    </button>
  );
}

export function ExternalLink({
  to,
  text,
  noUnderline,
}: { to: string; text: string; noUnderline?: boolean }) {
  const { handleLinkClick } = useNavigate();
  return (
    <Link
      text={text}
      onClick={() => handleLinkClick(to)}
      noUnderline={noUnderline}
    />
  );
}

export function InternalLink({
  to,
  text,
  noUnderline,
}: {
  to: {
    path: Routes;
    params?: { [key: string]: string };
  };
  text: string;
  noUnderline?: boolean;
}) {
  const { navigate } = useNavigate();
  return (
    <Link
      onClick={() => navigate(to.path, to.params)}
      text={text}
      noUnderline={noUnderline}
    />
  );
}
