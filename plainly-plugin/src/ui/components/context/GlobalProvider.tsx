import { evalScriptAsync } from '@src/node/utils';
import type { AnyProjectIssue } from '@src/ui/types/validation';
import { createContext, useEffect, useState } from 'react';
import { useNotifications } from '../../hooks';

interface GlobalContextProps {
  contextReady?: boolean;
  documentId?: string;
  plainlyProject?: {
    id: string;
    revisionCount: number;
  };
  projectIssues?: AnyProjectIssue[];
}

// Extended value type to also expose the React state setter so children can update.
interface GlobalContextValue extends GlobalContextProps {
  setProjectData: React.Dispatch<React.SetStateAction<GlobalContextProps>>;
}

export const GlobalContext = createContext<GlobalContextValue>(
  {} as GlobalContextValue,
);

export const GlobalProvider = ({ children }: { children: React.ReactNode }) => {
  const { notifyInfo } = useNotifications();
  const [projectData, setProjectData] = useState<GlobalContextProps>();

  useEffect(() => {
    const interval = setInterval(async () => {
      const data = await evalScriptAsync('getProjectData()');

      if (data) {
        const parsedData: {
          documentId?: string;
          id?: string;
          revisionCount?: number;
        } = JSON.parse(data);

        let newData: GlobalContextProps = {
          plainlyProject: parsedData.id
            ? {
                id: parsedData.id,
                revisionCount: parsedData.revisionCount || 0,
              }
            : undefined,
        };

        if (!projectData?.documentId && parsedData.documentId) {
          newData = { documentId: parsedData.documentId, ...newData };
        } else if (
          projectData?.documentId &&
          parsedData.documentId !== projectData.documentId
        ) {
          notifyInfo("We've detected a new project.");
          newData = { documentId: parsedData.documentId, ...newData };
        } else {
          // Update only the plainlyProject if documentId is the same
          newData = { ...projectData, ...newData };
        }
        setProjectData({
          ...newData,
          contextReady: true,
        });
      } else {
        setProjectData({ contextReady: true });
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [notifyInfo, projectData]);

  const contextValue: GlobalContextValue = {
    ...projectData,
    setProjectData,
  } as GlobalContextValue; // cast because spread of possibly undefined

  return (
    <GlobalContext.Provider value={contextValue}>
      {children}
    </GlobalContext.Provider>
  );
};
