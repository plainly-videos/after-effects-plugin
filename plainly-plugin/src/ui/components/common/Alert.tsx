import classNames from 'classnames';
import {
  CheckCircleIcon,
  InfoIcon,
  TriangleAlertIcon,
  XCircleIcon,
} from 'lucide-react';

type AlertType = 'danger' | 'warning' | 'info' | 'success';

export default function Alert({
  title,
  type,
  className,
}: { title: string; type: AlertType; className?: string }) {
  const Icon = ({ type }: { type: AlertType }) => {
    switch (type) {
      case 'danger':
        return <XCircleIcon className="text-red-400" />;
      case 'warning':
        return <TriangleAlertIcon className="text-yellow-400" />;
      case 'info':
        return <InfoIcon className="text-blue-400" />;
      case 'success':
        return <CheckCircleIcon className="text-green-400" />;
    }
  };

  const danger = type === 'danger';
  const warning = type === 'warning';
  const info = type === 'info';
  const success = type === 'success';

  return (
    <div
      className={classNames(
        'rounded-md bg-[rgb(29,29,30)] border p-2',
        danger && 'border-red-400',
        warning && 'border-yellow-400',
        info && 'border-blue-400',
        success && 'border-green-400',
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
