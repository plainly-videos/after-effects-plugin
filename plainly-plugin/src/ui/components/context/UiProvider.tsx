import { createContext } from 'react';

interface UiContextProps {
  hasBanner: boolean;
}

export const UiContext = createContext<UiContextProps>({} as UiContextProps);

export function UiProvider({
  props,
  children,
}: { props: UiContextProps; children: React.ReactNode }) {
  return <UiContext.Provider value={props}>{children}</UiContext.Provider>;
}
