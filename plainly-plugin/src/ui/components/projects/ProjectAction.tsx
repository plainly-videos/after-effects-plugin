import classNames from 'classnames';
import type { LucideIcon } from 'lucide-react';

export function ProjectAction({
  icon: Icon,
  action,
  linked,
}: {
  icon: LucideIcon;
  action: () => void;
  linked?: boolean;
}) {
  return (
    <span
      className={classNames(
        'size-5 flex items-center justify-center cursor-pointer disabled:cursor-not-allowed group rounded-sm',
        linked
          ? 'bg-primary hover:bg-secondary hover:text-gray-400'
          : 'bg-secondary hover:bg-primary hover:text-gray-400',
      )}
      onClick={action}
    >
      <Icon className="size-3" />
    </span>
  );
}
