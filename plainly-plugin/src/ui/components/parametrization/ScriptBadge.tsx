import type {
  DraggableAttributes,
  DraggableSyntheticListeners,
} from '@dnd-kit/core';
import classNames from 'classnames';
import { GripVerticalIcon, XIcon } from 'lucide-react';

export function ScriptBadge({
  label,
  action,
  onRemove,
  disabled,
  index,
  dragListeners,
  dragAttributes,
}: {
  label: string;
  action?: () => void;
  onRemove?: () => void;
  disabled?: boolean;
  index: number;
  dragListeners?: DraggableSyntheticListeners;
  dragAttributes?: DraggableAttributes;
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
      <span
        className="flex items-center cursor-grab active:cursor-grabbing touch-none"
        {...dragAttributes}
        {...dragListeners}
        onClick={(e) => e.stopPropagation()}
      >
        <GripVerticalIcon className="size-2.5 text-gray-300" />
      </span>
      <span className="tabular-nums">{index + 1}.</span>
      <span>{label}</span>
      {onRemove && (
        <span
          className="absolute -top-1 -right-1 size-3.5 flex items-center justify-center rounded-full bg-gray-600 hover:bg-gray-500 cursor-pointer opacity-0 scale-50 group-hover:opacity-100 group-hover:scale-100 transition-all duration-150"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
        >
          <XIcon className="size-2.5" />
        </span>
      )}
    </span>
  );
}
