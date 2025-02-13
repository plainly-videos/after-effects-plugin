import FormData from 'form-data';
import { useCallback, useContext, useState } from 'react';
import { makeProjectZipTmpDir, removeFolder } from '../../../node';
import Button from '../common/Button';
import Description from '../typography/Description';
import Label from '../typography/Label';
import PageHeading from '../typography/PageHeading';

import fs from 'fs';
import { useNotifications } from '@src/ui/hooks';
import {
  useEditProject,
  useGetProjectDetails,
  useUploadProject,
} from '@src/ui/hooks/api';
import { useProjectData } from '../../hooks/useProjectData';
import type { Project } from '../../types/project';
import Alert from '../common/Alert';
import { AuthContext } from '../settings/AuthProvider';

export default function UploadForm() {
  const { apiKey } = useContext(AuthContext);
  const [projectData, setProjectData] = useProjectData();
  const { isLoading, data } = useGetProjectDetails(projectData?.id, apiKey);
  const { isPending: isUploading, mutateAsync: uploadProject } =
    useUploadProject();
  const { isPending: isEditing, mutateAsync: editProject } = useEditProject();
  const { notifySuccess, notifyError } = useNotifications();

  const projectExists = !!(projectData?.id && data);
  const removedFromDatabase = !!(projectData?.id && !data);

  const revisionHistoryCount = data?.revisionHistory?.length || 0;
  const badRevision =
    projectExists && projectData?.revisionCount !== revisionHistoryCount;

  const [inputs, setInputs] = useState<{
    projectName?: string;
    description?: string;
    tags?: string[];
  }>({});
  const [uploadMode, setUploadMode] = useState<'new' | 'edit'>();

  const uploadModes = [
    {
      value: 'new',
      label: 'Upload new',
      checked: uploadMode === 'new' || !projectExists,
      disabled: false,
      onChange: () => setUploadMode('new'),
    },
    {
      value: 'edit',
      label: 'Re-upload existing',
      checked: uploadMode === 'edit' || (projectExists && uploadMode !== 'new'),
      disabled: !projectExists,
      onChange: () => setUploadMode('edit'),
    },
  ];

  const loading = isLoading || isUploading || isEditing;
  const editing = uploadMode === 'edit' || uploadModes[1].checked;
  const analysisPending = !(data?.analysis?.done || data?.analysis?.failed);
  const disabled = loading || (editing && analysisPending);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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

      let project: Project | undefined = undefined;

      if (projectExists && editing) {
        project = await editProject({
          apiKey,
          projectId: projectData.id,
          formData,
        });
      } else {
        project = await uploadProject({ apiKey, formData });
      }

      if (project) {
        const projectId = project.id;
        const revisionCount = project.revisionHistory?.length || 0;
        setProjectData({ id: projectId, revisionCount });
      }

      notifySuccess(
        'Project uploaded',
        `Successfully uploaded project ${project?.name}, analysis started.`,
      );
    } catch (error) {
      notifyError('Failed to upload project', (error as Error).message);
    } finally {
      if (collectFilesDirValue) {
        await removeFolder(collectFilesDirValue);
      }
      if (zipPathValue) {
        fs.rmSync(zipPathValue);
      }
    }
  };

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      if (name === 'tags') {
        setInputs((prev) => ({
          ...prev,
          tags: value.split(','),
        }));
      }

      if (name === 'projectName' || name === 'description') {
        setInputs((prev) => ({
          ...prev,
          [name]: value,
        }));
      }
    },
    [],
  );

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
                    checked={mode.checked}
                    onChange={mode.onChange}
                    disabled={mode.disabled}
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
            {removedFromDatabase && (
              <Alert
                title="Local project that used to exist on the platform, has been removed."
                type="warning"
                className="mt-4"
              />
            )}
            {editing && badRevision && (
              <Alert
                title="Local project is out of date with the platform."
                type="warning"
                className="mt-4"
              />
            )}
            {editing && analysisPending && (
              <Alert
                title="Analysis is still in progress."
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
              defaultValue={data?.name || inputs.projectName || ''}
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
              defaultValue={data?.description || inputs.description || ''}
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
              defaultValue={data?.attributes?.tags || inputs.tags || ''}
              onChange={handleChange}
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
