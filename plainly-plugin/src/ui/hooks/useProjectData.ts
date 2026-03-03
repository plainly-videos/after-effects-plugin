import type { ProjectData } from 'plainly-types';
import { useEffect, useState } from 'react';
import semver from 'semver';
import { AeScriptsApi } from '../../node/bridge/AeScriptsApi';

export const useProjectData = () => {
  const [aeVersion, setAeVersion] = useState<string>();

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

  useEffect(() => {
    (async () => {
      try {
        const version = await AeScriptsApi.getAfterEffectsVersion();
        setAeVersion(semver.valid(semver.coerce(version)) || undefined);
      } catch (error) {
        setAeVersion(undefined);
        console.error('Error getting After Effects version:', error);
      }
    })();

    return () => {
      // Cleanup if necessary
    };
  }, []);

  return { setProjectData, removeProjectData, getProjectData, aeVersion };
};
