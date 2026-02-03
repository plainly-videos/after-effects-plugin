import { Transition } from '@headlessui/react';
import { useNotifications } from '@src/ui/hooks';
import type { NotificationType } from '@src/ui/types';
import classNames from 'classnames';
import { CircleCheckBigIcon, InfoIcon, XIcon } from 'lucide-react';

function Notification({
  title,
  type,
  description,
  code,
  onClose,
  isFirst,
  isLast,
}: {
  title: string;
  type: NotificationType;
  description?: string;
  code?: string;
  onClose: () => void;
  isFirst?: boolean;
  isLast?: boolean;
}) {
  return (
    <>
      {/* Global notification live region, render this permanently at the end of the document */}
      <div className="flex w-full flex-col items-center space-y-4 sm:items-end">
        {/* Notification panel, dynamically insert this into the live region when it needs to be displayed */}
        <Transition show>
          <div
            className={classNames(
              'pointer-events-auto w-full bg-[rgb(29,29,30)] max-w-sm overflow-hidden shadow-lg ring-1 ring-white/20 transition data-[closed]:data-[enter]:translate-y-2 data-[enter]:transform data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-100 data-[enter]:ease-out data-[leave]:ease-in data-[closed]:data-[enter]:sm:translate-x-2 data-[closed]:data-[enter]:sm:translate-y-0',
              isFirst && 'rounded-t-lg',
              isLast && 'rounded-b-lg',
            )}
          >
            <div className="p-4">
              <div className="flex items-start">
                <div className="shrink-0">
                  {type === 'success' && (
                    <CircleCheckBigIcon
                      aria-hidden="true"
                      className="size-6 text-green-400"
                    />
                  )}
                  {type === 'error' && (
                    <XIcon aria-hidden="true" className="size-6 text-red-400" />
                  )}
                  {type === 'info' && (
                    <InfoIcon
                      aria-hidden="true"
                      className="size-6 text-blue-400"
                    />
                  )}
                </div>
                <div className="ml-3 w-0 flex-1 pt-0.5">
                  <p className="text-sm font-medium text-white">{title}</p>
                  {description && (
                    <p className="mt-1 text-sm text-gray-400">{description}</p>
                  )}
                  {code && <p className="mt-1 text-xs text-gray-500">{code}</p>}
                </div>
                <div className="ml-4 flex shrink-0">
                  <button
                    type="button"
                    onClick={onClose}
                    className="inline-flex rounded-md text-white hover:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  >
                    <span className="sr-only">Close</span>
                    <XIcon aria-hidden="true" className="size-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </>
  );
}

export function NotificationsOverlay() {
  const { notifications, clearNotification } = useNotifications();

  return (
    <div
      aria-live="assertive"
      className="flex flex-col fixed pointer-events-none inset-0 justify-end px-4 py-6 sm:justify-start sm:p-6 z-50"
    >
      {notifications.map((notification) => (
        <Notification
          key={notification.title}
          title={notification.title}
          type={notification.type}
          description={notification.description}
          code={notification.code}
          onClose={() => clearNotification(notification.id)}
          isFirst={notifications.indexOf(notification) === 0}
          isLast={
            notifications.indexOf(notification) === notifications.length - 1
          }
        />
      ))}
    </div>
  );
}
