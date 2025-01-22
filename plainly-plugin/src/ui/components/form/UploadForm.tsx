import FormData from 'form-data';
import { useEffect, useState } from 'react';
import { makeProjectZipTmpDir, removeFolder } from '../../../node';
import { get, postFormData } from '../../../node/request';
import Button from '../common/Button';
import Description from '../typography/Description';
import Label from '../typography/Label';
import PageHeading from '../typography/PageHeading';

import fs from 'fs';
import { evalScriptAsync } from '../../../node/utils';
import { useNotifications } from '@src/ui/hooks';
import { useProjectData } from '../../hooks/useProjectData';
import { useSessionStorage } from '../../hooks/useSessionStorage';
import type { Project } from '../../types/model';
import Alert from '../common/Alert';
import { useAuthContext } from '../settings/AuthProvider';

const uploadModes = [
  {
    value: 'new',
    label: 'Upload new',
  },
  {
    value: 'edit',
    label: 'Re-upload existing',
  },
];

export default function UploadForm({
  apiKey,
  projectId,
  existing,
  badRevision,
  badDecrypt,
}: {
  apiKey: string | undefined;
  projectId: string | undefined;
  existing?: boolean;
  badRevision?: boolean;
  badDecrypt?: boolean;
}) {
  const { apiKey, decryptedKey } = useAuthContext();
  const { projectData } = useProjectData();
  const { notifySuccess, notifyError } = useNotifications();

  const [loading, setLoading] = useState(false);
  const [badRevision, setBadRevision] = useState(false);
  const [projectExists, setProjectExists] = useState<boolean | undefined>();
  const [storedValue] = useSessionStorage('pin', '');

  const [uploadMode, setUploadMode] = useState<'edit' | 'new'>();
  const [inputs, setInputs] = useState<{
    projectName?: string;
    description?: string;
    tags?: string[];
  }>({});

  const { id, revision } = projectData || {};
  const canceledKeyDecrypt = storedValue === 'cancelled';
  const disabledEdit = uploadMode === 'edit' && projectExists === false;
  const disabled = loading || !apiKey || canceledKeyDecrypt || disabledEdit;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (disabled) {
      return;
    }
    setLoading(true);

    let collectFilesDirValue: string | undefined;
    let zipPathValue: string | undefined;

    try {
      const { collectFilesDir, zipPath } = await makeProjectZipTmpDir();
      collectFilesDirValue = collectFilesDir;
      zipPathValue = zipPath;
      const file = fs.createReadStream(zipPath);
      const tags = inputs.tags?.map((tag) => tag.trim());
      const formData = new FormData();
      formData.append('file', file);
      inputs.projectName && formData.append('name', inputs.projectName);
      inputs.description && formData.append('description', inputs.description);
      if (tags) {
        for (const tag of tags) {
          formData.append('tags', tag);
        }
      }

      const keyToUse = decryptedKey || apiKey;

      const { data: project } = await postFormData<Project>(
        `/api/v2/projects${uploadMode === 'edit' ? `/${id}` : ''}`,
        keyToUse,
        formData,
      );

      const projectId = project.id;
      const revisionHistory = project.revisionHistory;
      const latestRevision = revisionHistory?.[revisionHistory.length - 1].id;
      const projectName = project.name;

      await evalScriptAsync(
        `setProjectData("${projectId}", "${latestRevision}", "${projectName}")`,
      );

      notifySuccess('Project uploaded');
      setInputs({});
    } catch (error) {
      notifyError('Failed to upload project', (error as Error).message);
    } finally {
      if (collectFilesDirValue) {
        await removeFolder(collectFilesDirValue);
      }
      if (zipPathValue) {
        fs.rmSync(zipPathValue);
      }
      setLoading(false);
    }
  };

  useEffect(() => {
    // early exit
    if (disabled || uploadMode !== 'edit') {
      return;
    }
    setLoading(true);

    const keyToUse = decryptedKey || apiKey;

    const fetchProject = async (key: string) => {
      try {
        const { data } = await get<Project>(`/api/v2/projects/${id}`, key);

        const revisionHistory = data.revisionHistory;
        const latestRevision = revisionHistory?.[revisionHistory.length - 1].id;

        if (latestRevision !== revision) {
          setBadRevision(true);
        }

        setProjectExists(true);
        notifySuccess('Project fetched successfully');
      } catch (error) {
        setProjectExists(false);
        notifyError('Failed to fetch project', (error as Error).message);
      }
    };

    fetchProject(keyToUse);
    setLoading(false);
  }, [
    disabled,
    decryptedKey,
    apiKey,
    id,
    revision,
    uploadMode,
    notifyError,
    notifySuccess,
  ]);

  useEffect(() => {
    if (projectData) {
      setUploadMode('edit');
    } else {
      setUploadMode('new');
    }
  }, [projectData]);

  return (
    <form className="space-y-4 w-full text-white" onSubmit={handleSubmit}>
      <div className="space-y-4 border-b border-white/10 pb-4">
        <div>
          <PageHeading heading="Upload" />
          <Description className="mt-1">
            Upload your working project directly to Plainly Videos.
          </Description>
        </div>

        {!apiKey && (
          <Alert
            title="To upload a project, you must have a valid API key set up in the settings."
            type="danger"
          />
        )}

        {canceledKeyDecrypt && (
          <Alert
            title="To use this action, you need to provide a PIN for your API key."
            type="danger"
          />
        )}

        {uploadMode === 'edit' && projectExists === false && (
          <Alert
            title="Couldn't find a project on the platform. Please upload a new project."
            type="danger"
          />
        )}

        {uploadMode === 'edit' && badRevision && (
          <Alert
            title="Local project is out of date with the platform."
            type="warning"
          />
        )}

        <div className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-6">
          <div className="col-span-full">
            <Label label="Upload mode" htmlFor="upload-mode" />
            <Description>
              Select how you want to upload your project. Either upload a new
              project to the platform, or edit an existing project.
            </Description>
            <div className="mt-4 space-y-4 xs:flex xs:items-center xs:space-x-10 xs:space-y-0">
              {uploadModes.map((mode) => (
                <div key={mode.value} className="flex items-center">
                  <input
                    id={mode.value}
                    name="upload-mode"
                    type="radio"
                    value={mode.value}
                    checked={uploadMode === mode.value}
                    onChange={(e) => {
                      setUploadMode(e.target.value as 'edit' | 'new');
                    }}
                    className="relative size-4 appearance-none rounded-full border border-gray-300 bg-[rgb(29,29,30)] before:absolute before:inset-1 before:rounded-full before:bg-white checked:border-indigo-600 checked:bg-indigo-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:border-gray-300 disabled:bg-gray-100 disabled:before:bg-gray-400 forced-colors:appearance-auto forced-colors:before:hidden [&:not(:checked)]:before:hidden"
                  />
                  <label
                    htmlFor={mode.value}
                    className="ml-3 block text-xs text-white"
                  >
                    {mode.label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="col-span-full">
            <Label label="Name" htmlFor="projectName" />
            <input
              id="projectName"
              name="projectName"
              type="text"
              className="col-start-1 row-start-1 block w-full rounded-md bg-white/5 px-3 py-1 text-xs text-white outline outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500"
              defaultValue={inputs.projectName}
              onChange={(e) =>
                setInputs((prev) => ({
                  ...prev,
                  projectName: e.target.value,
                }))
              }
            />
          </div>

          <div className="col-span-full">
            <Label label="Description" htmlFor="description" />
            <textarea
              id="description"
              name="description"
              className="col-start-1 row-start-1 block w-full rounded-md bg-white/5 px-3 py-1 text-xs text-white outline outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500"
              defaultValue={inputs.description}
              onChange={(e) =>
                setInputs((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
            />
          </div>

          <div className="col-span-full">
            <Label label="Tags" htmlFor="tags" />
            <Description>
              Tags help you group, filter and categorize your projects on
              Plainly Videos. Separate tags with a comma.
            </Description>
            <input
              id="tags"
              name="tags"
              type="text"
              className="mt-2 col-start-1 row-start-1 block w-full rounded-md bg-white/5 px-3 py-1 text-xs text-white outline outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500"
              onChange={(e) =>
                setInputs((prev) => ({
                  ...prev,
                  tags: e.target.value.split(','),
                }))
              }
              defaultValue={inputs.tags}
              placeholder="Example: Sports, Fitness, Gym"
            />
          </div>
        </div>
      </div>

      <Button className="float-right" loading={loading} disabled={disabled}>
        Upload
      </Button>
    </form>
  );
}
