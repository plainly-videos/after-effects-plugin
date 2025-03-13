import { ProjectsList } from '.';
import { PageHeading } from '../typography';

export function Projects() {
  return (
    <div className="space-y-4 w-full text-white">
      <PageHeading heading="Plainly projects" />
      <ProjectsList />
    </div>
  );
}
