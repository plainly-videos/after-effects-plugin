import type { ProjectData } from 'plainly-types';
import { AeScriptsApi } from '../../node/bridge/AeScriptsApi';

export const useProjectData = () => {
  const getProjectData = async () => {
    try {
      const projectData = await AeScriptsApi.getProjectData();
      return projectData;
    } catch (error) {
      console.error('Error getting project data:', error);
      return undefined;
    }
  };

  const setProjectData = async (data: Omit<ProjectData, 'documentId'>) => {
    const { id, revisionCount } = data;
    await AeScriptsApi.setProjectData(id, revisionCount);
  };

  const removeProjectData = async () => await AeScriptsApi.removeProjectData();

  return { setProjectData, removeProjectData, getProjectData };
};
