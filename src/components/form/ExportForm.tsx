import { FolderIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
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
  const [projectName, setProjectName] = useState<string>();
  const [zipStatus, setZipStatus] = useState<{
    title: string;
    type: 'success' | 'error';
    description?: string;
  }>();

  console.log(zipStatus);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (targetPath) collectFiles(targetPath, setProjectName);
  };

  useEffect(() => {
    const handleZipping = async () => {
      if (targetPath && projectName) {
        try {
          await zip(targetPath, projectName, setZipStatus);
          if (zipStatus?.type === 'success') {
            removeFolder(`${targetPath}/${projectName}`);
            setProjectName(undefined);
            setTargetPath(undefined);
            setZipStatus(undefined);
          }
        } catch (err) {
          setZipStatus({
            title: 'Failed to zip',
            type: 'error',
            description: (err as Error).message,
          });
        }
      }
    };

    handleZipping();
  }, [targetPath, projectName, zipStatus?.type]);

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="space-y-6 border-b border-white/10 pb-6">
        <div className="space-y-6">
          <div>
            <PageHeading heading="Export files" />
            <PageDescription className="mt-1">
              When you click the button below, a zip file will be created in the
              specified folder containing all asset files and fonts used in your
              project. The zip file will have the same name as the project.
            </PageDescription>
          </div>

          <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
            <div className="col-span-full">
              <Label label="Destination folder" htmlFor="destination-folder" />
              <button
                type="button"
                onClick={() => selectFolder(setTargetPath)}
                className="mt-2 flex justify-center rounded-lg border border-dashed border-white/25 px-6 py-4 group w-full hover:border-white/10"
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
                          ? targetPath
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
        <Button disabled={!targetPath || targetPath === 'undefined'}>
          Export
        </Button>
      </div>

      {zipStatus && (
        <Notification
          title={zipStatus.title}
          type={zipStatus.type}
          description={zipStatus.description}
          onClose={() => {
            setProjectName(undefined);
            setZipStatus(undefined);
          }}
        />
      )}
    </form>
  );
}
