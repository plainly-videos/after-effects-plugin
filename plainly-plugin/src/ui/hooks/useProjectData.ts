import { useEffect, useState } from 'react';
import { AeScriptsApi } from '../../node/bridge/AeScriptsApi';
import type { ProjectData } from '../types';

export const useProjectData = (): [
  (data: Omit<ProjectData, 'documentId'>) => void,
  () => void,
  () => Promise<ProjectData | undefined>,
  number | undefined,
] => {
  const [aeVersion, setAeVersion] = useState<number>();

  const getData = async () => {
    try {
      const projectData = await AeScriptsApi.getProjectData();
      return projectData;
    } catch (error) {
      console.error('Error getting project data:', error);
      return undefined;
    }
  };

  const setData = async (data: Omit<ProjectData, 'documentId'>) => {
    const { id, revisionCount } = data;
    await AeScriptsApi.setProjectData(id, revisionCount);
  };

  const removeData = async () => await AeScriptsApi.removeProjectData();

  useEffect(() => {
    (async () => {
      try {
        const version = await AeScriptsApi.getAfterEffectsVersion();
        setAeVersion(parseFloat(version));
      } catch (error) {
        setAeVersion(undefined);
        console.error('Error getting After Effects version:', error);
      }
    })();

    return () => {
      // Cleanup if necessary
    };
  }, []);

  return [setData, removeData, getData, aeVersion];
};
