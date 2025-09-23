import classNames from 'classnames';

export function Description({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p className={classNames('text-xs text-gray-400', className)}>{children}</p>
  );
}
