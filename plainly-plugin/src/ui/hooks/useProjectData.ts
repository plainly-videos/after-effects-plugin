import { AeScriptsApi } from '../../node/bridge/AeScriptsApi';
import type { ProjectData } from '../types';

export const useProjectData = (): [
  (data: Omit<ProjectData, 'documentId'>) => void,
  () => void,
  () => Promise<ProjectData | undefined>,
] => {
  const getData = async () => {
    try {
      const parsedData = await AeScriptsApi.getProjectData();
      if (!parsedData) {
        console.warn('No project data found.');
        return undefined;
      }
      return parsedData;
    } catch (error) {
      console.error('Error getting project data:', error);
      return undefined;
    }
  };

  const setData = async (data: Omit<ProjectData, 'documentId'>) => {
    const { id, revisionCount } = data;

    await AeScriptsApi.setProjectData(id, revisionCount);
  };

  const removeData = async () => {
    await AeScriptsApi.removeProjectData();
  };

  return [setData, removeData, getData];
};
