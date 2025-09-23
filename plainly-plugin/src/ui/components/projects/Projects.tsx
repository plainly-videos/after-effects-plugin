import { PageHeading } from '../typography';
import { ProjectsList } from '.';

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
