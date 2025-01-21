import { useEffect, useState } from 'react';
import UploadForm from '../components/form/UploadForm';
import MainWrapper from '../components/layout/MainWrapper';
import { useProjectData } from '../hooks/useProjectData';
import { get } from '../../node/request';
import { useSettings } from '../hooks/useSettings';
import { LoaderCircleIcon } from 'lucide-react';

export default function UploadRoute() {
  const { projectData } = useProjectData();
  const { getSettingsApiKey, loading } = useSettings();
  const { apiKey } = getSettingsApiKey();

  const [projectExists, setProjectExists] = useState<boolean | undefined>();

  useEffect(() => {
    const fetchProject = async (projectId: string) => {
      try {
        await get(`/api/v2/projects/${projectId}`, apiKey);
        setProjectExists(true);
      } catch (error) {
        setProjectExists(false);
        throw new Error((error as Error).message);
      }
    };

    if (projectData?.id) {
      fetchProject(projectData?.id);
    }
  }, [apiKey, projectData?.id]);

  return (
    <MainWrapper>
      {loading ? (
        <LoaderCircleIcon className="animate-spin shrink-0 mx-auto size-6 text-white my-auto" />
      ) : (
        <UploadForm
          existing={projectExists}
          apiKey={apiKey}
          projectId={projectData?.id}
        />
      )}
    </MainWrapper>
  );
}
