import { useCallback, useState } from 'react';
import { NotificationType } from '../types';

export const useNotification = () => {
  const [notifications, setNotifications] = useState<
    { title: string; type: NotificationType; description?: string }[]
  >([]);

  const clearNotification = useCallback(() => {
    setNotifications((prev) => prev.filter((n) => n !== prev[0]));
  }, []);

  const notifySuccess = useCallback(
    (title: string, description?: string) => {
      setNotifications((prev) => [
        ...prev,
        {
          title,
          type: NotificationType.SUCCESS,
          description,
        },
      ]);

      setTimeout(() => {
        clearNotification();
      }, 3000);
    },
    [clearNotification],
  );

  const notifyError = useCallback((title: string, description?: string) => {
    setNotifications((prev) => [
      ...prev,
      {
        title,
        type: NotificationType.ERROR,
        description,
      },
    ]);
  }, []);

  return {
    notifications,
    notifySuccess,
    notifyError,
    clearNotification,
  };
};
