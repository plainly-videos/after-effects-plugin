import classNames from 'classnames';
import { ChevronLeftIcon, ChevronRightIcon, XIcon } from 'lucide-react';

export function ScriptBadge({
  label,
  action,
  onRemove,
  disabled,
  position,
  onMoveLeft,
  onMoveRight,
}: {
  label: string;
  action?: () => void;
  onRemove?: () => void;
  disabled?: boolean;
  position: { index: number; total: number };
  onMoveLeft: () => void;
  onMoveRight: () => void;
}) {
  return (
    <span
      className={classNames(
        'group relative inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-2xs font-medium text-white bg-gray-500 hover:bg-gray-400',
        action && !disabled && 'cursor-pointer',
        disabled && 'opacity-50',
      )}
      onClick={disabled ? undefined : action}
    >
      <button
        type="button"
        className={classNames(
          'flex items-center justify-center',
          position.index === 0
            ? 'opacity-20 pointer-events-none'
            : 'cursor-pointer hover:text-gray-200',
        )}
        onClick={(e) => {
          e.stopPropagation();
          onMoveLeft();
        }}
        disabled={position.index === 0}
      >
        <ChevronLeftIcon className="size-2.5" />
      </button>
      <span className="tabular-nums">{position.index + 1}</span>
      <button
        type="button"
        className={classNames(
          'flex items-center justify-center',
          position.index === position.total - 1
            ? 'opacity-20 pointer-events-none'
            : 'cursor-pointer hover:text-gray-200',
        )}
        onClick={(e) => {
          e.stopPropagation();
          onMoveRight();
        }}
        disabled={position.index === position.total - 1}
      >
        <ChevronRightIcon className="size-2.5" />
      </button>
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
