import { useGetProjectDetails } from '@src/ui/hooks';
import { Routes } from '@src/ui/types';
import { LoaderCircleIcon } from 'lucide-react';
import { useContext } from 'react';
import { Breadcrumb, Breadcrumbs } from '../common';
import { AuthContext } from '../settings';

export function ProjectDetails({ id }: { id: string }) {
  const { apiKey } = useContext(AuthContext);
  const { isLoading, data } = useGetProjectDetails(id, apiKey);

  if (isLoading)
    return (
      <LoaderCircleIcon className="animate-spin shrink-0 mx-auto size-6 text-white my-auto" />
    );

  if (!data) return null;

  console.log(data);

  return (
    <div className="space-y-4 w-full text-white">
      <Breadcrumbs>
        <Breadcrumb to={{ path: Routes.PROJECTS }} label="Projects" firstItem />
        <Breadcrumb
          to={{ path: Routes.PROJECT, params: { id } }}
          label={data.name}
        />
      </Breadcrumbs>
    </div>
  );
}
