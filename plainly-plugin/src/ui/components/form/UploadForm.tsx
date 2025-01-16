import FormData from 'form-data';
import { useState } from 'react';
import { makeProjectZip, makeTmpDir, removeFolder } from '../../../node';
import { postFormData } from '../../../node/request';
import Button from '../common/Button';
import Description from '../typography/Description';
import Label from '../typography/Label';
import PageHeading from '../typography/PageHeading';

import fs from 'fs';
import { LoaderCircleIcon } from 'lucide-react';
import { TMP_DIR } from '../../../node/constants';
import { useNotification } from '../../hooks/useNotification';
import { useSettings } from '../../hooks/useSettings';
import Alert from '../common/Alert';
import Notification from '../common/Notification';

export default function UploadForm() {
  const [inputs, setInputs] = useState<{
    projectName?: string;
    description?: string;
    tags?: string[];
  }>({});
  const [loading, setLoading] = useState(false);
  const { notification, notifySuccess, notifyError, clearNotification } =
    useNotification();
  const { getSettingsApiKey, loading: settingsLoading } = useSettings();

  const apiKey = getSettingsApiKey();

  const disabled = loading || !apiKey?.key;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    let collectFilesDirValue: string | undefined;
    let zipPathValue: string | undefined;

    try {
      await makeTmpDir();
      const { collectFilesDir, zipPath } = await makeProjectZip(TMP_DIR);
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

      await postFormData('/api/v2/projects', apiKey.key, formData);

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

  return (
    <form className="space-y-4 w-full text-white" onSubmit={handleSubmit}>
      <div className="space-y-4 border-b border-white/10 pb-4">
        <div>
          <PageHeading heading="Upload" />
          <Description className="mt-1">
            Upload your working project directly to Plainly Videos.
          </Description>
        </div>

        {settingsLoading && (
          <LoaderCircleIcon className="animate-spin shrink-0 mx-auto size-6" />
        )}

        {!settingsLoading && (
          <div className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-6">
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
        )}

        {!apiKey?.key && (
          <Alert
            title="To upload a project, you must have a valid API key set up in the Settings."
            danger
          />
        )}
      </div>

      <Button className="float-right" loading={loading} disabled={disabled}>
        Upload
      </Button>

      {notification && (
        <Notification
          title={notification.title}
          type={notification.type}
          description={notification.description}
          onClose={clearNotification}
        />
      )}
    </form>
  );
}
