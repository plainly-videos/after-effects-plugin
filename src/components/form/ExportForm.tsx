import classNames from 'classnames';
import { FolderIcon } from 'lucide-react';
import { useState } from 'react';
import {
  collectFiles,
  removeFolder,
  selectFolder,
  zip,
} from '../../node/export';
import Button from '../common/Button';
import Notification from '../common/Notification';
import Label from '../typography/Label';
import PageDescription from '../typography/PageDescription';
import PageHeading from '../typography/PageHeading';

export default function ExportForm() {
  const [targetPath, setTargetPath] = useState<string>();
  const [loading, setLoading] = useState(false);
  const [zipStatus, setZipStatus] = useState<{
    title: string;
    type: 'success' | 'error';
    description?: string;
  }>();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (targetPath) {
      try {
        const [result, projectName] = await collectFiles(targetPath);
        await zip(result, projectName);
        await removeFolder(result);
        setZipStatus({
          title: 'Successfully zipped',
          type: 'success',
          description: `Zip file created at: ${decodeURI(result)}`,
        });
        setLoading(false);
      } catch (error) {
        setZipStatus({
          title: 'Failed to zip',
          type: 'error',
          description: (error as Error).message,
        });
        setLoading(false);
      }
    }
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="space-y-6 border-b border-white/10 pb-6">
        <div className="space-y-6">
          <div>
            <PageHeading heading="Export files" />
            <PageDescription className="mt-1">
              Creates a zip file in the specified folder containing all asset
              files and fonts used in your project. The project file will be
              saved before the zip process starts. The zip file will have the
              same name as the project and will be overwritten if it already
              exists.
            </PageDescription>
          </div>

          <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
            <div
              className={classNames(
                'col-span-full',
                loading && 'cursor-not-allowed opacity-50',
              )}
            >
              <Label label="Destination folder" htmlFor="destination-folder" />
              <button
                type="button"
                disabled={loading}
                onClick={() => selectFolder(setTargetPath)}
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
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-end gap-x-6">
        <Button
          disabled={!targetPath || targetPath === 'undefined' || loading}
          loading={loading}
        >
          Export
        </Button>
      </div>

      {zipStatus && (
        <Notification
          title={zipStatus.title}
          type={zipStatus.type}
          description={zipStatus.description}
          onClose={() => setZipStatus(undefined)}
        />
      )}
    </form>
  );
}
