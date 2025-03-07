import classNames from 'classnames';
import {
  CheckCircleIcon,
  InfoIcon,
  TriangleAlertIcon,
  XCircleIcon,
} from 'lucide-react';

type AlertType = 'danger' | 'warning' | 'info' | 'success';

export function Alert({
  title,
  type,
  className,
}: { title: string; type: AlertType; className?: string }) {
  const Icon = ({
    type,
    className,
  }: { type: AlertType; className?: string }) => {
    const dangerClassName = classNames('text-red-400', className);
    const warningClassName = classNames('text-yellow-400', className);
    const infoClassName = classNames('text-blue-400', className);
    const successClassName = classNames('text-green-400', className);

    switch (type) {
      case 'danger':
        return <XCircleIcon className={dangerClassName} />;
      case 'warning':
        return <TriangleAlertIcon className={warningClassName} />;
      case 'info':
        return <InfoIcon className={infoClassName} />;
      case 'success':
        return <CheckCircleIcon className={successClassName} />;
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
      <div className="flex items-start">
        <div className="shrink-0">
          <Icon aria-hidden="true" type={type} className="size-4" />
        </div>
        <div className="ml-2">
          <p className="text-xs font-medium text-white">{title}</p>
        </div>
      </div>
    </div>
  );
}
