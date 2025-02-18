import { handleLinkClick } from '@src/ui/utils';

export function Link({
  to,
  text,
  onClick,
}: { to: string; text: string; onClick?: () => void }) {
  // TODO: rebase and use useNavigate for internal links

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
  return <Link to={to} text={text} onClick={handleLinkClick.bind(null, to)} />;
}
