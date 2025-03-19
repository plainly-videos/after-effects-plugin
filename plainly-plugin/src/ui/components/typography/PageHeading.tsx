import classNames from 'classnames';
import { useContext } from 'react';
import { UiContext } from '../context';

export function PageHeading({
  heading,
  className,
}: { heading: string; className?: string }) {
  const { hasBanner } = useContext(UiContext);

  return (
    <div>
      <h2
        className={classNames(
          'text-sm/7 font-medium text-white',
          className,
          hasBanner && 'mt-4 sm:mt-0',
        )}
      >
        {heading}
      </h2>
    </div>
  );
}
