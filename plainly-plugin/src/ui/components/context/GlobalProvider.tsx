import { AeScriptsApi } from '@src/node/bridge/AeScriptsApi';
import { createContext, useEffect, useState } from 'react';
import { useNotifications } from '../../hooks';

interface GlobalContextProps {
  documentId?: string;
  plainlyProject?: {
    id: string;
    revisionCount: number;
  };
}

export const GlobalContext = createContext<GlobalContextProps | undefined>(
  {} as GlobalContextProps,
);

export const GlobalProvider = ({ children }: { children: React.ReactNode }) => {
  const { notifyInfo } = useNotifications();
  const [globalData, setGlobalData] = useState<
    GlobalContextProps | undefined
  >();

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
          newData = { ...globalData, ...newData };
          setGlobalData(newData);
        }
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [notifyInfo, globalData]);

  return (
    <GlobalContext.Provider value={globalData}>
      {children}
    </GlobalContext.Provider>
  );
};
