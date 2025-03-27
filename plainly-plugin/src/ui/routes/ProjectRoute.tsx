import { AuthProvider, MainWrapper, ProjectDetails } from '../components';

export function ProjectRoute({ projectId }: { projectId: string | undefined }) {
  return (
    <MainWrapper>
      <AuthProvider>
        <ProjectDetails projectId={projectId} />
      </AuthProvider>
    </MainWrapper>
  );
}
