import { LoaderCircleIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { get } from '../../node/request';
import UploadForm from '../components/form/UploadForm';
import MainWrapper from '../components/layout/MainWrapper';
import { useProjectData } from '../hooks/useProjectData';
import { useSettings } from '../hooks/useSettings';
import type { Project } from '../types/model';

export default function UploadRoute() {
  const { projectData } = useProjectData();
  const { getSettingsApiKey, loading: loadingApiKey } = useSettings();
  const { apiKey } = getSettingsApiKey();

  const [loading, setLoading] = useState(false);
  const [projectExists, setProjectExists] = useState<boolean | undefined>();
  const [badRevision, setBadRevision] = useState<boolean | undefined>();

  const isLoading = loadingApiKey || loading;

  useEffect(() => {
    const fetchProject = async (projectId: string) => {
      setLoading(true);
      if (!apiKey) {
        return;
      }

      try {
        const { data } = await get<Project>(
          `/api/v2/projects/${projectId}`,
          apiKey,
        );
        setProjectExists(true);

        const revisionHistory = data.revisionHistory;
        const latestRevision = revisionHistory?.[revisionHistory.length - 1].id;

        if (latestRevision !== projectData?.revision) {
          setBadRevision(true);
        }
      } catch (error) {
        setProjectExists(false);
        throw new Error((error as Error).message);
      } finally {
        setLoading(false);
      }
    };

    if (projectData?.id) {
      fetchProject(projectData?.id);
    }
  }, [apiKey, projectData?.id, projectData?.revision]);

  return (
    <MainWrapper>
      {isLoading ? (
        <LoaderCircleIcon className="animate-spin shrink-0 mx-auto size-6 text-white my-auto" />
      ) : (
        <UploadForm
          apiKey={apiKey}
          projectId={projectData?.id}
          existing={projectExists}
          badRevision={badRevision}
        />
      )}
    </MainWrapper>
  );
}
