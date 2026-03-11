import classNames from 'classnames';

const indigoVariant = 'bg-indigo-500 hover:bg-indigo-400';

export function Badge({
  label,
  action,
  variant = 'indigo',
}: {
  label: string;
  action?: () => void;
  variant?: 'indigo';
}) {
  return (
    <span
      className={classNames(
        'inline-flex items-center rounded-md px-1.5 py-0.5 text-xs font-medium text-white',
        action && 'cursor-pointer',
        variant === 'indigo' && indigoVariant,
      )}
      onClick={action}
    >
      {label}
    </span>
  );
}
