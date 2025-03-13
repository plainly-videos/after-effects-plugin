import { useCallback } from 'react';
import { State, setGlobalState, useGlobalState } from '../state/store';
import type { Routes } from '../types';
import { useBreakpoint } from './useBreakpoint';

export const useNavigate = () => {
  const biggerThanXS = useBreakpoint('xs');
  const [settings] = useGlobalState(State.SETTINGS);
  const { sidebarOpen, currentPage } = settings;

  const navigate = useCallback(
    (to: Routes, params?: { [key: string]: string }) => {
      let path = to as string;
      if (params) {
        for (const [key, value] of Object.entries(params)) {
          path = path.replace(`:${key}`, String(value));
        }
      }

      setGlobalState(State.SETTINGS, {
        ...settings,
        currentPage: path,
        sidebarOpen: biggerThanXS === false ? false : sidebarOpen,
      });
    },
    [biggerThanXS, settings, sidebarOpen],
  );

  return { navigate, currentPage, sidebarOpen };
};
