import { useCallback, useState } from 'react';
import { type Notification, NotificationType } from '../types';

export const useNotification = () => {
  const [notification, setNotification] = useState<Notification>();

  const clearNotification = useCallback(() => {
    setNotification(undefined);
  }, []);

  const notifySuccess = useCallback(
    (title: string, description?: string) => {
      setNotification({
        title,
        type: NotificationType.SUCCESS,
        description,
      });

      setTimeout(() => {
        clearNotification();
      }, 3000);
    },
    [clearNotification],
  );

  const notifyError = useCallback((title: string, description?: string) => {
    setNotification({
      title,
      type: NotificationType.ERROR,
      description,
    });
  }, []);

  return {
    notification,
    notifySuccess,
    notifyError,
    clearNotification,
  };
};
