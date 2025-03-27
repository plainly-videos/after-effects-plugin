import classNames from 'classnames';

export function PageHeading({
  heading,
  className,
}: {
  heading: string;
  className?: string;
}) {
  return (
    <h2 className={classNames('text-sm/7 font-medium text-white', className)}>
      {heading}
    </h2>
  );
}
