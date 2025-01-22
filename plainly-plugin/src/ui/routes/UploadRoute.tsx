import { LoaderCircleIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { get } from '../../node/request';
import UploadForm from '../components/form/UploadForm';
import MainWrapper from '../components/layout/MainWrapper';
import PinOverlay from '../components/settings/PinOverlay';
import { useProjectData } from '../hooks/useProjectData';
import { useSettings } from '../hooks/useSettings';
import type { Project } from '../types/model';
import { useSessionStorage } from '../hooks/useSessionStorage';

export default function UploadRoute() {
  const { projectData } = useProjectData();
  const { settings, getSettingsApiKey, loading: loadingApiKey } = useSettings();
  const { encrypted } = settings.apiKey || {};
  const { getItem } = useSessionStorage();

  const [loading, setLoading] = useState(false);
  const [projectExists, setProjectExists] = useState<boolean | undefined>();
  const [badRevision, setBadRevision] = useState<boolean | undefined>();

  const [decrypted, setDecrypted] = useState<string | undefined>();

  const isLoading = loadingApiKey || loading;

  useEffect(() => {
    setLoading(true);

    const fetchProject = async (projectId: string, key: string) => {
      try {
        const { data } = await get<Project>(
          `/api/v2/projects/${projectId}`,
          key,
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

    if (projectData?.id && decrypted) {
      fetchProject(projectData.id, decrypted);
    }

    setLoading(false);
  }, [projectData?.id, projectData?.revision, decrypted]);

  useEffect(() => {
    const storedPin = getItem('pin');
    if (encrypted && storedPin) {
      const { key } = getSettingsApiKey(true, storedPin);
      setDecrypted(key);
      return;
    }

    if (!encrypted) {
      const { key } = getSettingsApiKey();
      setDecrypted(key);
      return;
    }
  }, [encrypted, getSettingsApiKey, getItem]);

  return (
    <MainWrapper>
      {isLoading ? (
        <LoaderCircleIcon className="animate-spin shrink-0 mx-auto size-6 text-white my-auto" />
      ) : (
        <>
          {encrypted && !decrypted ? (
            <PinOverlay onSubmit={setDecrypted} />
          ) : (
            <UploadForm
              apiKey={decrypted}
              projectId={projectData?.id}
              existing={projectExists}
              badRevision={badRevision}
            />
          )}
        </>
      )}
    </MainWrapper>
  );
}
