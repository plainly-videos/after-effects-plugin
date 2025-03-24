import { useCallback } from 'react';
import { State, setGlobalState, useGlobalState } from '../state/store';
import type { Routes } from '../types';
import { useBreakpoint } from './useBreakpoint';

export const useNavigate = () => {
  const biggerThanXS = useBreakpoint('xs');
  const [settings] = useGlobalState(State.SETTINGS);
  const { sidebarOpen, currentPage } = settings;

  const navigate = useCallback(
    (to: Routes) => {
      setGlobalState(State.SETTINGS, {
        ...settings,
        currentPage: to,
        sidebarOpen: biggerThanXS === false ? false : sidebarOpen,
      });
    },
    [biggerThanXS, settings, sidebarOpen],
  );

  const handleLinkClick = useCallback((link: string | undefined) => {
    if (!link) return;
    // @ts-expect-error
    cep.util.openURLInDefaultBrowser(link);
  }, []);

  return { navigate, currentPage, sidebarOpen, handleLinkClick };
};
