import { ProjectsList } from '.';
import { PageHeading } from '../typography';

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
