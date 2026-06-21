import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from '@headlessui/react';
import { useGetProjects } from '@src/ui/hooks/api';
import { State, useGlobalState } from '@src/ui/state/store';
import classNames from 'classnames';
import { FolderIcon, LoaderCircleIcon, XIcon } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Button } from '../common';
import { Description, Label } from '../typography';

export function FolderPicker({
  folder,
  onChange,
}: {
  folder?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  const [dialogOpen, setDialogOpen] = useState(false);

  const dispatch = (value: string) => {
    onChange({
      target: { name: 'folder', value },
    } as React.ChangeEvent<HTMLInputElement>);
  };

  return (
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
            className="w-full rounded-l-md border-none bg-white/5 px-3 py-1 text-xs text-white outline outline-1 -outline-offset-1 outline-white/10 focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            value={folder === '/' ? 'Root' : folder || 'No folder'}
            disabled
          />
          {folder && folder !== '/' && (
            <XIcon
              className="size-4 absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer hover:text-gray-200"
              onClick={() => dispatch('/')}
            />
          )}
        </div>
        <button
          type="button"
          className="-ml-px rounded-r-md border-none bg-white/10 hover:bg-white/20 px-3 py-1 text-xs text-white outline outline-1 -outline-offset-1 outline-white/10 focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-indigo-500 whitespace-nowrap"
          onClick={() => setDialogOpen(true)}
        >
          Choose folder
        </button>
      </div>
      <FolderPickerDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSelect={(value) => {
          dispatch(value);
          setDialogOpen(false);
        }}
      />
    </div>
  );
}

function FolderPickerDialog({
  open,
  onClose,
  onSelect,
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (value: string) => void;
}) {
  const { data, isLoading } = useGetProjects();
  const [settings] = useGlobalState(State.SETTINGS);
  const sidebarOpen = settings.sidebarOpen;

  const [folderName, setFolderName] = useState('');

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
    <Dialog open={open} onClose={onClose} className="relative">
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
                    className="col-start-1 row-start-1 block w-full rounded-md border-none bg-white/5 px-3 py-1 text-xs text-white outline outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500"
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
                        onClick={() => onSelect(folder)}
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
                onClick={() => {
                  onSelect(folderName);
                  setFolderName('');
                }}
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
                onClick={onClose}
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
  );
}
