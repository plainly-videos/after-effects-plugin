import classNames from 'classnames';

export default function PageHeading({
  heading,
  className,
}: { heading: string; className?: string }) {
  return (
    <div>
      <h2 className={classNames('text-sm/7 font-medium text-white', className)}>
        {heading}
      </h2>
    </div>
  );
}
