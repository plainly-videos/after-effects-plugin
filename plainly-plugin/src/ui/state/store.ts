import { createGlobalState } from 'react-hooks-global-state';
import { type GlobalSettings, type Notification, Routes } from '../types';

export enum State {
  SETTINGS = 'settings',
  NOTIFICATIONS = 'notifications',
}

const initialState = {
  [State.SETTINGS]: {
    currentPage: `${Routes.PROJECTS}/cc248d67-87cf-4946-b326-744c6e1b1a0d`,
    sidebarOpen: false,
  } as GlobalSettings,
  [State.NOTIFICATIONS]: [] as Notification[],
};

const { useGlobalState, getGlobalState, setGlobalState } =
  createGlobalState(initialState);

function resetGlobalState() {
  setGlobalState(State.SETTINGS, {
    currentPage: `${Routes.PROJECTS}/cc248d67-87cf-4946-b326-744c6e1b1a0d`,
    sidebarOpen: false,
  });
  setGlobalState(State.NOTIFICATIONS, []);
}

export { useGlobalState, getGlobalState, setGlobalState, resetGlobalState };
