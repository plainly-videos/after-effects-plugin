import { createGlobalState } from 'react-hooks-global-state';
import { Routes, type GlobalSettings } from '../types';

export enum State {
  SETTINGS = 'settings',
}

const initialState = {
  [State.SETTINGS]: {
    currentPage: Routes.EXPORT,
    sidebarOpen: false,
  } as GlobalSettings,
};

const { useGlobalState, getGlobalState, setGlobalState } =
  createGlobalState(initialState);

function resetGlobalState() {
  setGlobalState(State.SETTINGS, {
    currentPage: Routes.EXPORT,
    sidebarOpen: false,
  });
}

export { useGlobalState, getGlobalState, setGlobalState, resetGlobalState };
