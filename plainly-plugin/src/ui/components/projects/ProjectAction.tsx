import classNames from 'classnames';
import type { LucideProps } from 'lucide-react';

export function ProjectAction({
  icon: Icon,
  action,
  linked,
}: {
  icon: React.ForwardRefExoticComponent<
    Omit<LucideProps, 'ref'> & React.RefAttributes<SVGSVGElement>
  >;
  action: (e: React.MouseEvent) => void;
  linked?: boolean;
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
    >
      <Icon className="size-3" />
    </button>
  );
}
