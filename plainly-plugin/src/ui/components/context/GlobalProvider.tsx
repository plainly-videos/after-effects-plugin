import { AeScriptsApi } from '@src/node/bridge/AeScriptsApi';
import { createContext, useEffect, useState } from 'react';
import { useNotifications } from '../../hooks';

interface GlobalContextProps {
  documentId?: string;
  plainlyProject?: {
    id: string;
    revisionCount: number;
  };
  projectValidation?: ProjectValidation;
}

export interface ProjectValidation {
  textLayers?: {
    allCaps: {
      layerId: string;
      layerName: string;
      isValid: false;
    }[];
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

  useEffect(() => {
    const interval = setInterval(async () => {
      const data = await evalScriptAsync('validateProject()');

      if (data) {
        const parsedData: ProjectValidation = JSON.parse(data);

        if (
          JSON.stringify(parsedData) !==
          JSON.stringify(projectData?.projectValidation)
        ) {
          setProjectData((prev) => ({
            ...prev,
            projectValidation: parsedData,
          }));
        }
      }
    }, 6000);

    return () => clearInterval(interval);
  }, [projectData?.projectValidation]);

  return (
    <GlobalContext.Provider value={globalData}>
      {children}
    </GlobalContext.Provider>
  );
};
