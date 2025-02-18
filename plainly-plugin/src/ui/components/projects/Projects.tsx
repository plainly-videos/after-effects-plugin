import Description from '../typography/Description';
import PageHeading from '../typography/PageHeading';
import { ProjectsList } from './ProjectsList';

export function Projects() {
  return (
    <div className="space-y-4 w-full text-white">
      <div>
        <PageHeading heading="Custom projects" />
        <Description className="mt-1">
          List of all uploaded projects that exist on platform.
        </Description>
      </div>
      <ProjectsList />
    </div>
  );
}
