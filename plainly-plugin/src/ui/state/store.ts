import { createGlobalState } from 'react-hooks-global-state';
import { type GlobalSettings, type Notification, Routes } from '../types';

export enum State {
  SETTINGS = 'settings',
  NOTIFICATIONS = 'notifications',
}

const initialState = {
  [State.SETTINGS]: {
    currentPage: Routes.EXPORT,
    sidebarOpen: false,
    documentId: '',
  } as GlobalSettings,
  [State.NOTIFICATIONS]: [] as Notification[],
};

const { useGlobalState, getGlobalState, setGlobalState } =
  createGlobalState(initialState);

function resetGlobalState() {
  setGlobalState(State.SETTINGS, {
    currentPage: Routes.EXPORT,
    sidebarOpen: false,
    documentId: '',
  });
  setGlobalState(State.NOTIFICATIONS, []);
}

export { useGlobalState, getGlobalState, setGlobalState, resetGlobalState };
