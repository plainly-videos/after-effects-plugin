import { FolderIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { collectFiles, selectFolder, zip } from '../../node/export';
import Button from '../common/Button';
import Notification from '../common/Notification';

export default function ExportForm() {
  const [targetPath, setTargetPath] = useState<string>();
  const [projectName, setProjectName] = useState<string>();
  const [zipStatus, setZipStatus] = useState<{
    title: string;
    type: 'success' | 'error';
    description?: string;
  }>();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (targetPath) collectFiles(targetPath, setProjectName);
  };

  useEffect(() => {
    if (targetPath && projectName) {
      zip(targetPath, projectName, setZipStatus);
      setTargetPath(undefined);
      setProjectName(undefined);
    }
  }, [targetPath, projectName]);

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="space-y-12 border-b border-white/10 pb-12">
        <div>
          <h2 className="text-base/7 font-semibold text-white">Export files</h2>
          <p className="mt-1 text-sm/6 text-gray-400">
            Lorem, ipsum dolor sit amet consectetur adipisicing elit. Hic culpa
            facilis maiores cumque. Illum, qui. Vitae nam repellat porro
            consectetur?
          </p>

          <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
            <div className="col-span-full">
              <label
                htmlFor="destination-folder"
                className="block text-sm/6 font-semibold text-white"
              >
                Destination folder
              </label>
              <div className="mt-2 flex justify-center rounded-lg border border-dashed border-white/25 px-6 py-10">
                <div className="text-center">
                  <FolderIcon
                    fill="rgb(107 114 128 / 1"
                    aria-hidden="true"
                    className="mx-auto size-12 text-gray-500"
                  />
                  <div className="mt-4 flex text-sm/6 text-gray-400">
                    <label
                      htmlFor="folder-select"
                      className="relative cursor-pointer rounded-md bg-gray-900 font-semibold text-white focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-600 focus-within:ring-offset-2 focus-within:ring-offset-gray-900 hover:text-indigo-500"
                    >
                      <button
                        type="button"
                        onClick={() => selectFolder(setTargetPath)}
                      >
                        {targetPath && targetPath !== 'undefined'
                          ? targetPath
                          : 'Select folder'}
                      </button>
                    </label>
                  </div>
                </div>
              </div>
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
        />
      )}
    </form>
  );
}
