import classNames from 'classnames';
import { LoaderCircleIcon } from 'lucide-react';
import type { ComponentPropsWithRef } from 'react';

export default function Button({
  children,
  className,
  onClick,
  secondary,
  disabled,
  loading,
  type = 'submit',
}: {
  secondary?: boolean;
  loading?: boolean;
} & ComponentPropsWithRef<'button'>) {
  const primary = !secondary;
  const classPrimary =
    'bg-indigo-500 hover:bg-indigo-400 focus-visible:outline-indigo-500 border-transparent text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2';
  const classSecondary = 'bg-white/10 hover:bg-white/20 text-white';

  return (
    <button
      onClick={onClick}
      className={classNames(
        'rounded-md px-2.5 py-1.5 text-xs font-medium shadow-sm disabled:cursor-not-allowed disabled:opacity-50 flex items-center',
        primary && classPrimary,
        secondary && classSecondary,
        loading && 'animate-pulse-tailwind',
        className,
      )}
      type={type}
      disabled={disabled}
    >
      {children}
      {loading && (
        <LoaderCircleIcon className="ml-1 size-4 shrink-0 animate-spin" />
      )}
    </button>
  );
}
