import classNames from 'classnames';
import type { LucideProps } from 'lucide-react';

export function ProjectAction({
  icon: Icon,
  action,
  disabled,
  fill,
  linked,
}: {
  icon: React.ForwardRefExoticComponent<
    Omit<LucideProps, 'ref'> & React.RefAttributes<SVGSVGElement>
  >;
  action: () => void;
  disabled?: boolean;
  fill?: string;
  linked?: boolean;
}) {
  return (
    <button
      className={classNames(
        'size-5 flex items-center justify-center cursor-pointer disabled:cursor-not-allowed group rounded-sm',
        linked
          ? 'bg-primary'
          : 'bg-secondary hover:bg-primary hover:text-gray-400',
        linked && !disabled && 'hover:bg-secondary hover:text-gray-400',
      )}
      type="button"
      onClick={action}
      disabled={disabled}
    >
      <Icon className="size-3" fill={fill} />
    </button>
  );
}
