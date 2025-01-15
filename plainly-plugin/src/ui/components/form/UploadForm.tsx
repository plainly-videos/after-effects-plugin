import { useState } from 'react';
import Button from '../common/Button';
import Description from '../typography/Description';
import Label from '../typography/Label';
import PageHeading from '../typography/PageHeading';
import { post } from '../../../node/request';
import {
  collectFiles,
  removeFolder,
  retrieveSettings,
  zip,
} from '../../../node';
import FormData from 'form-data';

import fs from 'fs';
import path from 'path';
import { settingsDirectory } from '../../../node/constants';
import { useNotification } from '../../hooks/useNotification';
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { apiKey } = await retrieveSettings();

      const tempDest = path.join(settingsDirectory, 'temp');
      if (!fs.existsSync(tempDest)) {
        fs.mkdirSync(tempDest, { recursive: true });
      }

      const { collectFilesDir, projectName } = await collectFiles(tempDest);
      await zip(collectFilesDir, projectName);
      await removeFolder(collectFilesDir);

      const file = fs.createReadStream(
        path.join(tempDest, `${projectName}.zip`),
      );
      const tags = inputs.tags?.map((tag) => tag.trim());

      const formData = new FormData();
      inputs.projectName && formData.append('name', inputs.projectName);
      inputs.description && formData.append('description', inputs.description);
      if (tags) {
        for (const tag of tags) {
          formData.append('tags', tag);
        }
      }
      formData.append('file', file);

      await post('/api/v2/projects', apiKey.key, formData);

      fs.rmSync(path.join(tempDest, `${projectName}.zip`), {
        recursive: true,
        force: true,
      });

      notifySuccess('Project uploaded');
      setInputs({});
      setLoading(false);
    } catch (error) {
      notifyError('Failed to upload project', (error as Error).message);
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
                setInputs((prev) => ({ ...prev, projectName: e.target.value }))
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

      <Button className="float-right" loading={loading} disabled={loading}>
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
