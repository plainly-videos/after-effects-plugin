import classNames from 'classnames';

const neutralVariant = 'bg-gray-500 hover:bg-gray-400';
const indigoVariant = 'bg-indigo-500 hover:bg-indigo-400';

export function Badge({
  label,
  action,
  variant = 'neutral',
  disabled,
}: {
  label: string;
  action?: () => void;
  variant?: 'neutral' | 'indigo';
  disabled?: boolean;
}) {
  return (
    <span
      className={classNames(
        'inline-flex items-center rounded-md px-1.5 py-0.5 text-xs font-medium text-white',
        action && 'cursor-pointer',
        variant === 'neutral' && neutralVariant,
        variant === 'indigo' && indigoVariant,
        disabled && 'opacity-50 pointer-events-none',
      )}
      onClick={action}
    >
      {label}
    </span>
  );
}
