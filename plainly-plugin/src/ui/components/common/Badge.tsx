import classNames from 'classnames';
import { XIcon } from 'lucide-react';

const neutralVariant = 'bg-gray-500 hover:bg-gray-400';
const indigoVariant = 'bg-indigo-500 hover:bg-indigo-400';

export function Badge({
  label,
  action,
  onRemove,
  variant = 'neutral',
  disabled,
}: {
  label: string;
  action?: () => void;
  onRemove?: () => void;
  variant?: 'neutral' | 'indigo';
  disabled?: boolean;
}) {
  return (
    <span
      className={classNames(
        'group relative inline-flex items-center rounded-md px-1.5 py-0.5 text-2xs font-medium text-white',
        action && !disabled && 'cursor-pointer',
        variant === 'neutral' && neutralVariant,
        variant === 'indigo' && indigoVariant,
        disabled && 'opacity-50',
      )}
      onClick={disabled ? undefined : action}
    >
      {label}
      {onRemove && !disabled && (
        <button
          type="button"
          className="absolute -top-1 -right-1 size-3.5 flex items-center justify-center rounded-full bg-gray-600 hover:bg-gray-500 cursor-pointer opacity-0 scale-50 group-hover:opacity-100 group-hover:scale-100 transition-all duration-150"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
        >
          <XIcon className="size-2.5" />
        </button>
      )}
    </span>
  );
}
