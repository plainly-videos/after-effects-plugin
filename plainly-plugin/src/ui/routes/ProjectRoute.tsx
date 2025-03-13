import { AuthProvider, MainWrapper, ProjectDetails } from '../components';

export function ProjectRoute({ id }: { id: string }) {
  return (
    <MainWrapper>
      <AuthProvider>
        <ProjectDetails id={id} />
      </AuthProvider>
    </MainWrapper>
  );
}
