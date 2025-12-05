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
  const [projectData, setProjectData] = useState<
    GlobalContextProps | undefined
  >();

  useEffect(() => {
    const interval = setInterval(async () => {
      const parsedData = await AeScriptsApi.getProjectData();

      if (parsedData) {
        const data: {
          documentId?: string;
          id?: string;
          revisionCount?: number;
        } = parsedData;

        let newData: GlobalContextProps = {
          plainlyProject: data.id
            ? {
                id: data.id,
                revisionCount: data.revisionCount || 0,
              }
            : undefined,
        };

        if (!projectData?.documentId && data.documentId) {
          newData = { documentId: data.documentId, ...newData };
          setProjectData(newData);
        } else if (
          projectData?.documentId &&
          data.documentId !== projectData.documentId
        ) {
          notifyInfo("We've detected a new project.");
          newData = { documentId: data.documentId, ...newData };
          setProjectData(newData);
        } else {
          // Update only the plainlyProject if documentId is the same
          newData = { ...projectData, ...newData };
          setProjectData(newData);
        }
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [notifyInfo, projectData]);

  return (
    <GlobalContext.Provider value={projectData}>
      {children}
    </GlobalContext.Provider>
  );
};
