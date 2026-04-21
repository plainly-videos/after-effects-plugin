import { getErrorDescription } from '@src/node/errors';
import crypto from 'crypto';
import { useCallback } from 'react';
import { State, useGlobalState } from '../state/store';
import {
  type Notification,
  type NotificationAction,
  NotificationType,
} from '../types';

export const useNotifications = () => {
  const [notifications, setNotifications] = useGlobalState(State.NOTIFICATIONS);

  const newNotification = useCallback(
    (
      title: string,
      type: NotificationType,
      description?: string,
      code?: string,
      action?: NotificationAction,
    ) => {
      const notification: Notification = {
        title,
        type,
        description,
        code,
        action,
        id: crypto.randomUUID(),
      };

      setNotifications((prev) => [...prev, notification]);
      return notification;
    },
    [setNotifications],
  );

  const clearNotification = useCallback(
    (id: string) => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    },
    [setNotifications],
  );

  const notifySuccess = useCallback(
    (title: string, description?: string) => {
      const notification = newNotification(
        title,
        NotificationType.SUCCESS,
        description,
      );

      setTimeout(() => clearNotification(notification.id), 5000);
    },
    [newNotification, clearNotification],
  );

  const notifyError = useCallback(
    (title: string, details?: unknown, action?: NotificationAction) => {
      const { description, code } = getErrorDescription(details) || {};
      newNotification(title, NotificationType.ERROR, description, code, action);
    },
    [newNotification],
  );

  const notifyInfo = useCallback(
    (title: string, description?: string) => {
      const notification = newNotification(
        title,
        NotificationType.INFO,
        description,
      );

      setTimeout(() => clearNotification(notification.id), 5000);
    },
    [newNotification, clearNotification],
  );

  return {
    notifications,
    notifySuccess,
    notifyError,
    notifyInfo,
    clearNotification,
    clearAllNotifications: () => setNotifications([]),
  };
};
