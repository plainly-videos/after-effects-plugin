import { useCallback, useState } from 'react';
import { type Notification, NotificationType } from '../types';

export const useNotification = () => {
  const [notification, setNotification] = useState<Notification>();

  const clear = useCallback(() => {
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
        clear();
      }, 3000);
    },
    [clear],
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
    clear,
  };
};
