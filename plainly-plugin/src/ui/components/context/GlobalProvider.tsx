import { AeScriptsApi } from '@src/node/bridge/AeScriptsApi';
import type { AnyProjectIssue } from 'plainly-types';
import { createContext, useCallback, useEffect, useState } from 'react';
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
  setGlobalData: React.Dispatch<React.SetStateAction<GlobalContextProps>>;
  validateProject: () => Promise<string | undefined>;
}

export const GlobalContext = createContext<GlobalContextValue>(
  {} as GlobalContextValue,
);

export const GlobalProvider = ({ children }: { children: React.ReactNode }) => {
  const { notifyInfo } = useNotifications();
  const [globalData, setGlobalData] = useState<GlobalContextProps>();

  const validateProject = useCallback(async () => {
    const issues = await AeScriptsApi.validateProject();
    if (!issues) {
      setGlobalData((prev) => ({ ...prev, projectIssues: [] }));
    } else {
      const parsedIssues: AnyProjectIssue[] = JSON.parse(issues);
      setGlobalData((prev) => ({
        ...prev,
        projectIssues: parsedIssues,
      }));
    }

    return issues;
  }, []);

  useEffect(() => {
    const interval = setInterval(async () => {
      const projectData = await AeScriptsApi.getProjectData();

      if (projectData) {
        let newData: GlobalContextProps = {
          plainlyProject: projectData.id
            ? {
                id: projectData.id,
                revisionCount: projectData.revisionCount || 0,
              }
            : undefined,
        };

        if (!globalData?.documentId && projectData.documentId) {
          newData = { documentId: projectData.documentId, ...newData };
          setGlobalData(newData);
        } else if (
          globalData?.documentId &&
          projectData.documentId !== globalData.documentId
        ) {
          notifyInfo("We've detected a new project.");
          newData = { documentId: projectData.documentId, ...newData };
          setGlobalData(newData);
        } else {
          // Update only the plainlyProject if documentId is the same
          newData = { ...globalData, ...newData, contextReady: true };
          setGlobalData(newData);
        }
      } else {
        setGlobalData({ contextReady: true });
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [notifyInfo, globalData]);

  const contextValue: GlobalContextValue = {
    ...globalData,
    setGlobalData,
    validateProject,
  } as GlobalContextValue; // cast because spread of possibly undefined

  return (
    <GlobalContext.Provider value={contextValue}>
      {children}
    </GlobalContext.Provider>
  );
};
