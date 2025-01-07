import classNames from 'classnames';

export default function Label({
  label,
  htmlFor,
  className,
}: { label: string; htmlFor?: string; className?: string }) {
  return (
    <label
      htmlFor={htmlFor}
      className={classNames(
        'block text-xs/6 font-medium text-white',
        className,
      )}
    >
      {label}
    </label>
  );
}
