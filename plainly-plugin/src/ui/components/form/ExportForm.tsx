import { useNotifications } from '@src/ui/hooks';
import classNames from 'classnames';
import { FolderIcon } from 'lucide-react';
import { useCallback, useState } from 'react';
import { makeProjectZip, selectFolder } from '../../../node/index';
import { openFolder } from '../../../node/utils';
import { Button, Checkbox } from '../common';
import { Description, Label, PageHeading } from '../typography';

export function ExportForm() {
  const [targetPath, setTargetPath] = useState<string>();
  const [loading, setLoading] = useState(false);
  const [openLocation, setOpenLocation] = useState(true);

  const { notifySuccess, notifyError } = useNotifications();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (targetPath) {
      try {
        const zipPath = await makeProjectZip(targetPath);
        notifySuccess('Zip file created', `Zip file created at: ${zipPath}`);
        setLoading(false);

        if (openLocation) openFolder(targetPath);
      } catch (error) {
        notifyError('Failed to collect files', (error as Error).message);
        setLoading(false);
      }
    }
  };

  const onSelectFolder = useCallback(async () => {
    const selectedPath = await selectFolder();
    setTargetPath(selectedPath);
  }, []);

  return (
    <form className="space-y-4 w-full text-white" onSubmit={handleSubmit}>
      <div className="space-y-4 border-b border-white/10 pb-4">
        <div>
          <PageHeading heading="Export files" />
          <Description className="mt-1">
            Creates a zip file in the specified folder containing all asset
            files and fonts used in your project. The project file will be saved
            before the zip process starts. The zip file will have the same name
            as the project and will be overwritten if it already exists.
          </Description>
        </div>

        <div className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-6">
          <div
            className={classNames(
              'col-span-full',
              loading && 'cursor-not-allowed opacity-50',
            )}
          >
            <Label
              label="Destination folder"
              htmlFor="destination-folder"
              required
            />
            <button
              type="button"
              disabled={loading}
              onClick={onSelectFolder}
              className="mt-2 flex justify-center rounded-lg border border-dashed border-white/25 px-6 py-4 group w-full hover:border-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="text-center">
                <FolderIcon
                  aria-hidden="true"
                  className="mx-auto size-8 text-gray-500 group-hover:text-gray-600 fill-gray-500 group-hover:fill-gray-600"
                />
                <div className="mt-1 flex text-xs text-gray-400">
                  <label
                    htmlFor="folder-select"
                    className="relative cursor-pointer rounded-md bg-inherit font-medium text-white focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-600 focus-within:ring-offset-2 focus-within:ring-offset-gray-900 group-hover:text-indigo-500"
                  >
                    <span>
                      {targetPath && targetPath !== 'undefined'
                        ? decodeURI(targetPath)
                        : 'Select folder'}
                    </span>
                  </label>
                </div>
              </div>
            </button>
          </div>

          <div className="col-span-full">
            <Checkbox
              label="Open location"
              description="Open the folder containing the zip file once the export is done."
              onChange={setOpenLocation}
              defaultChecked
            />
          </div>
        </div>
      </div>

      <Button
        className="float-right"
        disabled={!targetPath || targetPath === 'undefined' || loading}
        loading={loading}
      >
        Export
      </Button>
    </form>
  );
}
