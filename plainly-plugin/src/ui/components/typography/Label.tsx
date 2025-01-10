import classNames from 'classnames';

export default function Label({
  label,
  htmlFor,
  className,
  required = false,
}: {
  label: string;
  htmlFor?: string;
  className?: string;
  required?: boolean;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className={classNames(
        'block text-xs/6 font-medium text-white',
        className,
      )}
    >
      {label}
      {required && <span className="ml-1">*</span>}
    </label>
  );
}
