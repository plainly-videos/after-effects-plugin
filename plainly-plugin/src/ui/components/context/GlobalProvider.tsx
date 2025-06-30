import { evalScriptAsync } from '@src/node/utils';
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
          setProjectData(newData);
        } else if (
          projectData?.documentId &&
          parsedData.documentId !== projectData.documentId
        ) {
          notifyInfo("We've detected a new project.");
          newData = { documentId: parsedData.documentId, ...newData };
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
