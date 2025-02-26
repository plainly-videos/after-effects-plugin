import PageHeading from '../typography/PageHeading';
import { ProjectsList } from './ProjectsList';

export function Projects() {
  return (
    <div className="space-y-4 w-full text-white">
      <div>
        <PageHeading heading="Plainly projects" />
      </div>
      <ProjectsList />
    </div>
  );
}
