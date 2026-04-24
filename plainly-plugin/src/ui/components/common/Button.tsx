import classNames from 'classnames';
import { LoaderCircleIcon, type LucideIcon } from 'lucide-react';
import type { ComponentPropsWithRef } from 'react';

export function Button({
  children,
  className,
  onClick,
  secondary,
  disabled,
  loading,
  type = 'submit',
  icon: Icon,
  iconRight: IconRight,
  iconClassName,
}: {
  secondary?: boolean;
  loading?: boolean;
  icon?: LucideIcon;
  iconRight?: LucideIcon;
  iconClassName?: string;
} & ComponentPropsWithRef<'button'>) {
  const primary = !secondary;
  const classPrimary =
    'bg-indigo-500 hover:bg-indigo-400 focus-visible:outline-indigo-500 border-indigo-500 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2';
  const classSecondary =
    'bg-white/10 hover:bg-white/20 text-white border-white/10';

  const iconClass = classNames('size-4 shrink-0', iconClassName);
  const loaderClass = classNames('size-4 shrink-0 animate-spin', iconClassName);

  const showLoaderLeft = loading && !IconRight;
  const showLoaderRight = loading && !!IconRight;

  return (
    <button
      onClick={onClick}
      className={classNames(
        'border rounded-md px-2.5 py-1.5 text-xs font-medium shadow-sm disabled:cursor-not-allowed disabled:opacity-50 flex items-center gap-1',
        primary && classPrimary,
        secondary && classSecondary,
        loading && 'animate-pulse-tailwind',
        className,
      )}
      type={type}
      disabled={disabled}
    >
      {/* LEFT */}
      {!loading && Icon && <Icon className={iconClass} />}
      {showLoaderLeft && <LoaderCircleIcon className={loaderClass} />}

      {children}

      {/* RIGHT */}
      {!loading && IconRight && <IconRight className={iconClass} />}
      {showLoaderRight && <LoaderCircleIcon className={loaderClass} />}
    </button>
  );
}
