import classNames from 'classnames';

export function Checkbox({
  label,
  description,
  onChange,
  className,
  defaultChecked,
}: {
  label: string;
  description?: string;
  onChange: React.Dispatch<React.SetStateAction<boolean>>;
  className?: string;
  defaultChecked?: boolean;
}) {
  return (
    <div className={classNames('flex gap-3', className)}>
      <div className="flex h-6 shrink-0 items-center">
        <div className="group grid size-4 grid-cols-1">
          <input
            defaultChecked={defaultChecked}
            id="comments"
            name="comments"
            type="checkbox"
            aria-describedby="comments-description"
            className="col-start-1 row-start-1 appearance-none rounded border border-white/10 bg-white/5 checked:border-indigo-600 checked:bg-indigo-600 indeterminate:border-indigo-600 indeterminate:bg-indigo-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:border-white/10 disabled:bg-transparent forced-colors:appearance-auto"
            onChange={(e) => onChange(e.target.checked)}
          />
          <svg
            fill="none"
            viewBox="0 0 14 14"
            className="pointer-events-none col-start-1 row-start-1 size-3.5 self-center justify-self-center stroke-white group-has-[:disabled]:stroke-white/25"
          >
            <title>Check</title>
            <path
              d="M3 8L6 11L11 3.5"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="opacity-0 group-has-[:checked]:opacity-100"
            />
            <path
              d="M3 7H11"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="opacity-0 group-has-[:indeterminate]:opacity-100"
            />
          </svg>
        </div>
      </div>
      <div className="text-xs">
        <label htmlFor="comments" className="font-medium text-white">
          {label}
        </label>
        <p id="comments-description" className="text-gray-400">
          {description}
        </p>
      </div>
    </div>
  );
}
