import FormData from 'form-data';
import { useContext, useEffect, useState } from 'react';
import { makeProjectZipTmpDir, removeFolder } from '../../../node';
import { get, postFormData } from '../../../node/request';
import Button from '../common/Button';
import Description from '../typography/Description';
import Label from '../typography/Label';
import PageHeading from '../typography/PageHeading';

import fs from 'fs';
import { useNotifications } from '@src/ui/hooks';
import { useProjectData } from '../../hooks/useProjectData';
import type { Project } from '../../types/model';
import Alert from '../common/Alert';
import { AuthContext } from '../settings/AuthProvider';

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

export default function UploadForm() {
  const { apiKey } = useContext(AuthContext);
  const [projectData, setProjectData] = useProjectData();
  const { notifySuccess, notifyError } = useNotifications();

  const [loading, setLoading] = useState(false);
  const [badRevision, setBadRevision] = useState(false);
  const [projectExists, setProjectExists] = useState<boolean | undefined>();

  const [uploadMode, setUploadMode] = useState<'edit' | 'new'>();
  const [inputs, setInputs] = useState<{
    projectName?: string;
    description?: string;
    tags?: string[];
  }>({});

  const disabledEdit = uploadMode === 'edit' && !projectExists;
  const disabled = loading || disabledEdit;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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

      const { data: project } = await postFormData<Project>(
        `/api/v2/projects${uploadMode === 'edit' ? `/${projectData?.id}` : ''}`,
        apiKey,
        formData,
      );

      const projectId = project.id;
      const revisionCount = project.revisionHistory?.length || 0;
      const projectName = project.name;

      setProjectData({
        id: projectId,
        revisionCount: revisionCount,
        name: projectName,
      });

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
    const fetchProject = async (
      key: string,
      projectId: string,
      revisionCount: number,
    ) => {
      try {
        const { data } = await get<Project>(
          `/api/v2/projects/${projectId}`,
          key,
        );

        const revisionHistory = data.revisionHistory;
        const latestRevision = revisionHistory?.length || 0;

        if (latestRevision !== revisionCount) {
          setBadRevision(true);
        }

        setProjectExists(true);
      } catch (error) {
        setProjectExists(false);
      } finally {
        setLoading(false);
      }
    };

    if (
      uploadMode === 'edit' &&
      projectData?.id &&
      (projectData.revisionCount || projectData?.revisionCount === 0)
    ) {
      setLoading(true);
      fetchProject(apiKey, projectData.id, projectData.revisionCount);
    }
  }, [apiKey, projectData?.id, projectData?.revisionCount, uploadMode]);

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
                    disabled={!projectExists && mode.value === 'edit'}
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
            {uploadMode === 'edit' && !projectExists && !loading && (
              <Alert
                title="Couldn't find a project on the platform. Please upload a new project."
                type="danger"
                className="mt-4"
              />
            )}

            {uploadMode === 'edit' && badRevision && !loading && (
              <Alert
                title="Local project is out of date with the platform."
                type="warning"
                className="mt-4"
              />
            )}
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
