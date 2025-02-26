import FormData from 'form-data';
import { useCallback, useContext, useEffect, useState } from 'react';
import { makeProjectZipTmpDir, removeFolder } from '../../../node';

import fs from 'fs';
import { useNotifications, useProjectData } from '@src/ui/hooks';
import {
  useEditProject,
  useGetProjectDetails,
  useUploadProject,
} from '@src/ui/hooks/api';
import type { Project } from '@src/ui/types/project';
import classNames from 'classnames';
import { LoaderCircleIcon } from 'lucide-react';
import { Alert, Button } from '../common';
import { AuthContext } from '../settings';
import { Description, Label, PageHeading } from '../typography';

export function UploadForm() {
  const { apiKey } = useContext(AuthContext);
  const [projectData, setProjectData] = useProjectData();
  const { isLoading, data } = useGetProjectDetails(projectData?.id, apiKey);
  const { isPending: isUploading, mutateAsync: uploadProject } =
    useUploadProject();
  const { isPending: isEditing, mutateAsync: editProject } = useEditProject();
  const { notifySuccess, notifyError } = useNotifications();

  const [inputs, setInputs] = useState<{
    projectName?: string;
    description?: string;
    tags?: string[];
  }>({});
  const [uploadMode, setUploadMode] = useState<'new' | 'edit'>();

  const localProjectExists = !!projectData?.id;
  const remoteProjectExists = !!(localProjectExists && data);

  const editSelected = uploadMode === 'edit';
  const uploadModes = [
    {
      value: 'new',
      label: 'Upload new',
      checked: !editSelected,
      disabled: false,
      onChange: () => {
        setUploadMode('new');
        setInputs({});
      },
    },
    {
      value: 'edit',
      label: 'Re-upload existing',
      checked: editSelected,
      disabled: !remoteProjectExists,
      onChange: () => setUploadMode('edit'),
    },
  ];

  const loading = isUploading || isEditing;

  const analysisPending =
    remoteProjectExists && !(data?.analysis?.done || data?.analysis?.failed);

  const revisionHistoryCount = data?.revisionHistory?.length || 0;
  const badRevision =
    remoteProjectExists && projectData?.revisionCount !== revisionHistoryCount;

  const editing = uploadMode === 'edit' || uploadModes[1].checked;
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
      if (tags && tags.length > 0) {
        for (const tag of tags) {
          formData.append('tags', tag);
        }
      }

      let project: Project | undefined = undefined;

      if (remoteProjectExists && editing) {
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

      notifySuccess('Project uploaded');
      setUploadMode('edit');
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

  useEffect(() => {
    if (remoteProjectExists) {
      if (uploadMode === undefined) {
        setUploadMode('edit');
      }
    } else {
      if (uploadMode === 'edit') {
        setUploadMode(undefined);
      }
    }
  }, [remoteProjectExists, uploadMode]);

  return (
    <form className="space-y-4 w-full text-white" onSubmit={handleSubmit}>
      <div className="space-y-4 border-b border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <PageHeading heading="Upload" />
            {isLoading && (
              <LoaderCircleIcon className="animate-spin shrink-0 size-4 text-white" />
            )}
          </div>
          <Description className="mt-1">
            Upload your working project directly to Plainly Videos.
          </Description>
        </div>

        <div className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-6">
          <div className="col-span-full">
            <Label label="Upload mode" htmlFor="upload-mode" />
            <Description>
              Select how you want to upload your working project. Either upload
              a new project to the platform, or if you already have this project
              uploaded, you can edit it.
            </Description>
            <div className="mt-4 space-y-4 xs:flex xs:items-center xs:space-x-10 xs:space-y-0">
              {uploadModes.map((mode) => (
                <div
                  key={mode.value}
                  className={classNames(
                    'flex items-center',
                    mode.disabled && 'opacity-50',
                  )}
                >
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
            {localProjectExists && !remoteProjectExists && (
              <Alert
                title="Local project that used to exist on the platform, has been removed."
                type="info"
                className="mt-4"
              />
            )}
            {editing && badRevision && (
              <Alert
                title="Local project is out of date with the platform. Re-uploading it will overwrite any changes made on the platform."
                type="info"
                className="mt-4"
              />
            )}
            {editing && analysisPending && (
              <Alert
                title="Project analysis is still in progress..."
                type="info"
                className="mt-4"
              />
            )}
          </div>
        </div>

        {editSelected ? (
          <Inputs
            projectName={inputs.projectName || data?.name}
            description={inputs.description || data?.description}
            tags={inputs.tags || data?.attributes?.tags}
            onChange={handleChange}
          />
        ) : (
          <Inputs
            projectName={inputs.projectName}
            description={inputs.description}
            tags={inputs.tags}
            onChange={handleChange}
          />
        )}
      </div>

      <Button
        className="float-right"
        loading={loading}
        disabled={disabled || isLoading}
      >
        Upload
      </Button>
    </form>
  );
}

function Inputs({
  projectName,
  description,
  tags,
  onChange,
}: {
  projectName?: string;
  description?: string;
  tags?: string[];
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
}) {
  return (
    <>
      <div className="col-span-full">
        <Label label="Name" htmlFor="projectName" />
        <input
          id="projectName"
          name="projectName"
          type="text"
          className="col-start-1 row-start-1 block w-full rounded-md bg-white/5 px-3 py-1 text-xs text-white outline outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500"
          value={projectName || ''}
          onChange={onChange}
        />
      </div>

      <div className="col-span-full">
        <Label label="Description" htmlFor="description" />
        <textarea
          id="description"
          name="description"
          className="col-start-1 row-start-1 block w-full rounded-md bg-white/5 px-3 py-1 text-xs text-white outline outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500"
          value={description || ''}
          onChange={onChange}
        />
      </div>

      <div className="col-span-full">
        <Label label="Tags" htmlFor="tags" />
        <Description>
          Tags help you group, filter and categorize your projects on Plainly
          Videos. Separate tags with a comma.
        </Description>
        <input
          id="tags"
          name="tags"
          type="text"
          className="mt-2 col-start-1 row-start-1 block w-full rounded-md bg-white/5 px-3 py-1 text-xs text-white outline outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500"
          value={tags?.join(',') || ''}
          onChange={onChange}
          placeholder="Example: Sports, Fitness, Gym"
        />
      </div>
    </>
  );
}
