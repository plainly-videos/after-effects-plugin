import { useCallback, useState } from 'react';
import { type Notification, NotificationType } from '../types';
import { getGlobalState, State, useGlobalState } from '../state/store';
import crypto from 'crypto';

export const useNotifications = () => {
  const [notifications, setNotifications] = useGlobalState(State.NOTIFICATIONS);

  const getNotifications = useCallback(
    () => getGlobalState(State.NOTIFICATIONS),
    [],
  );

  const newNotification = useCallback(
    (title: string, type: NotificationType, description?: string) => {
      const notification: Notification = {
        title,
        type,
        description,
        id: crypto.randomUUID(),
      };

      setNotifications([...getNotifications(), notification]);
      return notification;
    },
    [getNotifications, setNotifications],
  );

  const clearNotification = useCallback(
    (id: string) => {
      const updatedNotifications = notifications.filter((n) => n.id !== id);
      setNotifications(updatedNotifications);
    },
    [setNotifications, notifications],
  );

  const notifySuccess = useCallback(
    (title: string, description?: string) => {
      const notification = newNotification(
        title,
        NotificationType.SUCCESS,
        description,
      );

      setTimeout(() => {
        clearNotification(notification.id);
      }, 5000);
    },
    [newNotification, clearNotification],
  );

  const notifyError = useCallback(
    (title: string, description?: string) => {
      newNotification(title, NotificationType.ERROR, description);
    },
    [newNotification],
  );

  return {
    notifications,
    notifySuccess,
    notifyError,
    clearNotification,
  };
};
