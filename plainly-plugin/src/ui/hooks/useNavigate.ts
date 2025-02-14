import { useCallback } from 'react';
import { State, setGlobalState, useGlobalState } from '../state/store';
import type { GlobalSettings } from '../types';
import { useBreakpoint } from './useBreakpoint';

export const useNavigate = () => {
  const biggerThanXS = useBreakpoint('xs');
  const [settings] = useGlobalState(State.SETTINGS);
  const { sidebarOpen, currentPage } = settings;

  const navigate = useCallback(
    (to: GlobalSettings['currentPage']) => {
      setGlobalState(State.SETTINGS, {
        ...settings,
        currentPage: to,
        sidebarOpen: biggerThanXS === false ? false : sidebarOpen,
      });
    },
    [biggerThanXS, settings, sidebarOpen],
  );

  return { navigate, currentPage, sidebarOpen };
};
