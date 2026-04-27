import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from '@headlessui/react';
import { useNotifications, useProjectData } from '@src/ui/hooks';
import {
  useEditProject,
  useGetProjectDetails,
  useGetProjects,
  useUploadProject,
} from '@src/ui/hooks/api';
import { State, useGlobalState } from '@src/ui/state/store';
import { Routes } from '@src/ui/types';
import type { Project } from '@src/ui/types/project';
import { startAsymptoticProgress } from '@src/ui/utils';
import classNames from 'classnames';
import FormData from 'form-data';
import fs from 'fs';
import { FolderIcon, LoaderCircleIcon, XIcon } from 'lucide-react';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { makeProjectZipTmpDir } from '../../../node';
import { CanceledApiError, FolderPermissionError } from '../../../node/errors';
import { openFolder } from '../../../node/utils';
import { Alert, Button, InternalLink, Tooltip } from '../common';
import { GlobalContext } from '../context';
import { Description, Label, PageHeading } from '../typography';

export function UploadForm() {
  const { plainlyProject, documentId } = useContext(GlobalContext);

  const { setProjectData, getProjectData } = useProjectData();
  const { isLoading, data } = useGetProjectDetails(plainlyProject?.id);
  const {
    isPending: isUploading,
    mutateAsync: uploadProject,
    cancel: cancelUpload,
  } = useUploadProject();
  const {
    isPending: isEditing,
    mutateAsync: editProject,
    cancel: cancelEdit,
  } = useEditProject();
  const { notifySuccess, notifyError, notifyInfo } = useNotifications();

  const [inputs, setInputs] = useState<{
    projectName?: string;
    description?: string;
    tags?: string[];
    folder?: string;
  }>({});
  const [uploadMode, setUploadMode] = useState<'new' | 'edit'>();
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isPacking, setIsPacking] = useState(false);

  const localProjectExists = !!plainlyProject?.id;
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

  const loading = isUploading || isEditing || isPacking;

  const analysisPending =
    remoteProjectExists && !(data?.analysis?.done || data?.analysis?.failed);

  const revisionHistoryCount = data?.revisionHistory?.length || 0;
  const badRevision =
    remoteProjectExists &&
    plainlyProject?.revisionCount !== revisionHistoryCount;

  const editing = uploadMode === 'edit' || uploadModes[1].checked;
  const disabled = loading || (editing && analysisPending);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let zipPathValue: string | undefined;
    setUploadProgress(0);
    setIsPacking(true);

    const stopProgress = startAsymptoticProgress(setUploadProgress);

    try {
      const formData = new FormData();

      const zipPath = await makeProjectZipTmpDir();
      zipPathValue = zipPath;
      const file = fs.createReadStream(zipPath);
      formData.append('file', file);

      const projectName = inputs.projectName?.trim();
      projectName && formData.append('name', projectName);

      const description = inputs.description?.trim();
      description && formData.append('description', description);

      const tagsSet = new Set(inputs.tags?.map((tag) => tag.trim()));
      const tags = Array.from(tagsSet).filter((tag) => tag.length > 0);
      if (tags.length > 0) {
        for (const tag of tags) {
          formData.append('tags', tag);
        }
      }

      const folder = inputs.folder?.trim();
      if (folder !== undefined && folder !== null) {
        formData.append('folder', folder);
      }

      let project: Project | undefined;

      // check if the `documentId` and project from `getProjectData` have the same ID
      const projectData = await getProjectData();
      if (documentId && projectData?.documentId !== documentId) {
        notifyError(
          'Project mismatch',
          'The project you are trying to upload does not match the current document.',
        );
        return;
      }

      setIsPacking(false);

      if (remoteProjectExists && editing) {
        project = await editProject({
          projectId: plainlyProject.id,
          formData,
        });
      } else {
        project = await uploadProject(formData);
      }

      if (project) {
        const projectId = project.id;
        const revisionCount = project.revisionHistory?.length || 0;
        setProjectData({ id: projectId, revisionCount });
      }

      stopProgress();
      setUploadProgress(100);
      notifySuccess('Project uploaded');
      setUploadMode('edit');
      setInputs({});
    } catch (error) {
      stopProgress();
      if (error instanceof CanceledApiError) {
        setUploadProgress(0);
        notifyInfo('Upload cancelled');
        return;
      }
      setUploadProgress(0);
      const action =
        error instanceof FolderPermissionError
          ? {
              label: 'Open folder',
              onClick: () => openFolder(error.folderPath),
            }
          : undefined;
      notifyError('Failed to upload project', error, action);
    } finally {
      if (zipPathValue) {
        fs.rmSync(zipPathValue);
      }
      setIsPacking(false);
    }
  };

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      if (name === 'tags') {
        setInputs((prev) => ({ ...prev, tags: value.split(',') }));
      }

      if (name === 'projectName' || name === 'description') {
        setInputs((prev) => ({ ...prev, [name]: value }));
      }

      if (name === 'folder') {
        setInputs((prev) => ({ ...prev, folder: value }));
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
      <div className="relative space-y-4 pb-4">
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10 rounded-md">
          <div
            className="h-1 bg-indigo-500 transition-all duration-300 rounded-md"
            style={{ width: `${uploadProgress}%` }}
          />
        </div>
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
            {!remoteProjectExists && (
              <Alert
                title={
                  <p>
                    Working project is not linked to any project on the Plainly
                    platform. If a matching project exists on the platform, go
                    to the <InternalLink to={Routes.PROJECTS} text="Projects" />{' '}
                    tab to link it.
                  </p>
                }
                type="info"
                className="mt-4"
              />
            )}
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
            folder={inputs.folder || data?.attributes?.folder}
            onChange={handleChange}
          />
        ) : (
          <Inputs
            projectName={inputs.projectName}
            description={inputs.description}
            tags={inputs.tags}
            folder={inputs.folder}
            onChange={handleChange}
          />
        )}
      </div>

      <div className="flex gap-2 float-right">
        {loading && (
          <Tooltip
            text={isPacking ? 'Cannot cancel during packing' : ''}
            disabled={!isPacking}
          >
            <Button
              type="button"
              secondary
              onClick={() => (isUploading ? cancelUpload() : cancelEdit())}
              disabled={isPacking}
            >
              Cancel
            </Button>
          </Tooltip>
        )}
        <Button loading={loading} disabled={disabled || loading}>
          Upload
        </Button>
      </div>
    </form>
  );
}

function Inputs({
  projectName,
  description,
  tags,
  folder,
  onChange,
}: {
  projectName?: string;
  description?: string;
  tags?: string[];
  folder?: string;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
}) {
  const { data, isLoading } = useGetProjects();
  const [settings] = useGlobalState(State.SETTINGS);
  const sidebarOpen = settings.sidebarOpen;

  const [folderDialogOpen, setFolderDialogOpen] = useState(false);
  const [folderName, setFolderName] = useState('');

  const selectFolder = (value: string) => {
    onChange({
      target: { name: 'folder', value },
    } as React.ChangeEvent<HTMLInputElement>);
    setFolderName('');
    setFolderDialogOpen(false);
  };

  const allFolders = useMemo(() => {
    const folders = new Set<string>();

    data?.forEach((p) => {
      const folderPath = p.attributes?.folder;
      if (typeof folderPath === 'string' && folderPath.trim() !== '') {
        const parts = folderPath.split('/');
        for (let i = 1; i <= parts.length; i++) {
          const partialPath = parts.slice(0, i).join('/');
          if (partialPath) folders.add(partialPath);
        }
      }
    });

    return Array.from(folders).sort();
  }, [data]);

  return (
    <>
      <div className="col-span-full">
        <Label label="Name" htmlFor="projectName" required />
        <input
          id="projectName"
          name="projectName"
          type="text"
          className="col-start-1 row-start-1 block w-full rounded-md bg-white/5 px-3 py-1 text-xs text-white outline outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500"
          value={projectName || ''}
          onChange={onChange}
          required
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
          className="mt-1 col-start-1 row-start-1 block w-full rounded-md bg-white/5 px-3 py-1 text-xs text-white outline outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500"
          value={tags?.join(',') || ''}
          onChange={onChange}
          placeholder="Example: Sports, Fitness, Gym"
        />
      </div>

      <div className="col-span-full">
        <Label label="Folder" htmlFor="folder" />
        <Description>
          Folders help you organize your projects on Plainly Videos.
        </Description>
        <div className="flex mt-1 col-start-1 row-start-1 w-full">
          <div className="relative w-full">
            <input
              id="folder"
              name="folder"
              type="text"
              className="w-full rounded-l-md bg-white/5 px-3 py-1 text-xs text-white outline outline-1 -outline-offset-1 outline-white/10 focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              value={folder === '/' ? 'Root' : folder || 'No folder'}
              onChange={onChange}
              disabled
            />
            {folder && folder !== '/' && (
              <XIcon
                className="size-4 absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer hover:text-gray-200"
                onClick={() => {
                  onChange({
                    target: {
                      name: 'folder',
                      value: '/',
                    },
                  } as React.ChangeEvent<HTMLInputElement>);
                }}
              />
            )}
          </div>
          <button
            type="button"
            className="-ml-px rounded-r-md bg-white/10 hover:bg-white/20 px-3 py-1 text-xs text-white outline outline-1 -outline-offset-1 outline-white/10 focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-indigo-500 whitespace-nowrap"
            onClick={() => setFolderDialogOpen(true)}
          >
            Choose folder
          </button>
        </div>
      </div>
      <Dialog
        open={folderDialogOpen}
        onClose={() => setFolderDialogOpen(false)}
        className="relative"
      >
        <DialogBackdrop
          transition
          className="fixed inset-0 backdrop-blur-md transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
        />

        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <DialogPanel
              transition
              className={classNames(
                'relative transform overflow-hidden rounded-lg bg-[rgb(29,29,30)] px-4 pb-4 pt-5 text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in sm:my-8 sm:w-full sm:max-w-lg sm:p-6 data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95 border border-white/10',
                sidebarOpen ? 'ml-[3.75rem] xs:ml-36' : 'ml-[3.75rem]',
              )}
            >
              <div className="sm:flex sm:items-start">
                <div className="mt-2 sm:ml-4 sm:mt-0">
                  <DialogTitle
                    as="h3"
                    className="text-sm font-semibold text-white"
                  >
                    Move to folder
                  </DialogTitle>
                  <div className="mt-1">
                    <Description>
                      Add the project to an existing folder or create a new one.
                      Follow the format{' '}
                      <span className="text-white font-medium whitespace-nowrap">
                        /folder/sub-folder
                      </span>{' '}
                      to create nested folder structures. If the folder does not
                      exist, it will be created.
                    </Description>
                  </div>
                  <div className="mt-4">
                    <Label label="Folder name" htmlFor="folderName" />
                    <input
                      id="folderName"
                      name="folderName"
                      type="text"
                      className="col-start-1 row-start-1 block w-full rounded-md bg-white/5 px-3 py-1 text-xs text-white outline outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500"
                      placeholder="/folder/sub-folder"
                      value={folderName}
                      onChange={(e) => {
                        const value = e.target.value.trim();
                        if (value && !value.startsWith('/'))
                          setFolderName(`/${value}`);
                        else setFolderName(value);
                      }}
                    />
                  </div>
                  <div className="mt-4">
                    <Label label="Existing folders" />
                    {isLoading && (
                      <LoaderCircleIcon className="animate-spin shrink-0 size-4 text-white" />
                    )}
                    {!isLoading &&
                      allFolders.map((folder) => (
                        <button
                          key={folder}
                          type="button"
                          className="flex items-center gap-2 text-sm text-white hover:bg-white/10 rounded-md px-2 py-1 w-full text-left"
                          onClick={() => selectFolder(folder)}
                        >
                          <FolderIcon className="size-4 text-gray-400" />
                          <span className="truncate">
                            {folder === '/' ? 'Root' : folder}
                          </span>
                        </button>
                      ))}
                  </div>
                </div>
              </div>
              <div className="mt-4 sm:mt-3 sm:flex sm:flex-row-reverse">
                <Button
                  type="button"
                  onClick={() => selectFolder(folderName)}
                  disabled={
                    !folderName.trim() ||
                    !folderName.startsWith('/') ||
                    folderName.endsWith('/')
                  }
                  className="inline-flex w-full sm:w-auto justify-center sm:ml-2"
                >
                  Add
                </Button>
                <Button
                  type="button"
                  onClick={() => setFolderDialogOpen(false)}
                  secondary
                  className="inline-flex mt-2 sm:mt-0 w-full sm:w-auto justify-center"
                >
                  Cancel
                </Button>
              </div>
            </DialogPanel>
          </div>
        </div>
      </Dialog>
    </>
  );
}
