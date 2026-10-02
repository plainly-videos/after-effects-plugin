import classNames from 'classnames';
import { LoaderCircleIcon, type LucideIcon } from 'lucide-react';

export function ProjectAction({
  icon: Icon,
  action,
  linked,
  loading,
}: {
  icon: LucideIcon;
  action: () => void;
  linked?: boolean;
  loading?: boolean;
}) {
  return (
    <button
      className={classNames(
        'size-5 flex items-center justify-center cursor-pointer disabled:cursor-not-allowed group rounded-sm',
        linked
          ? 'bg-primary hover:bg-secondary hover:text-gray-400'
          : 'bg-secondary hover:bg-primary hover:text-gray-400',
      )}
      type="button"
      onClick={action}
      disabled={loading}
    >
      {loading ? (
        <LoaderCircleIcon className="size-3 animate-spin" />
      ) : (
        <Icon className="size-3" />
      )}
    </button>
  );
}
