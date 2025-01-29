import classNames from 'classnames';
import { CheckCircleIcon, TriangleAlertIcon, XCircleIcon } from 'lucide-react';

export default function Alert({
  title,
  type,
  className,
}: { title: string; type: 'danger' | 'warning'; className?: string }) {
  const Icon = ({ type }: { type: 'danger' | 'warning' }) => {
    switch (type) {
      case 'danger':
        return <XCircleIcon className="text-red-400" />;
      case 'warning':
        return <TriangleAlertIcon className="text-yellow-400" />;
      default:
        return <CheckCircleIcon className="text-green-400" />;
    }
  };

  const danger = type === 'danger';
  const warning = type === 'warning';

  return (
    <div
      className={classNames(
        'rounded-md bg-[rgb(29,29,30)] border p-2 border-green-400',
        danger && 'border-red-400',
        warning && 'border-yellow-400',
        className,
      )}
    >
      <div className="flex items-center">
        <div className="shrink-0">
          <Icon aria-hidden="true" type={type} />
        </div>
        <div className="ml-3">
          <p className="text-xs font-medium text-white">{title}</p>
        </div>
      </div>
    </div>
  );
}
