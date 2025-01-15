import classNames from 'classnames';
import { CheckCircleIcon, XCircleIcon, XIcon } from 'lucide-react';

export default function Alert({
  title,
  danger,
}: { title: string; danger?: boolean }) {
  const Icon = () => {
    return danger ? (
      <XCircleIcon className="size-5 text-red-400" />
    ) : (
      <CheckCircleIcon className="size-5 text-green-400" />
    );
  };

  return (
    <div
      className={classNames(
        'rounded-md bg-[rgb(29,29,30)] border p-2',
        danger ? 'border-red-400' : 'border-green-400',
      )}
    >
      <div className="flex items-center">
        <div className="shrink-0">
          <Icon aria-hidden="true" />
        </div>
        <div className="ml-3">
          <p className="text-xs font-medium text-white">{title}</p>
        </div>
      </div>
    </div>
  );
}
