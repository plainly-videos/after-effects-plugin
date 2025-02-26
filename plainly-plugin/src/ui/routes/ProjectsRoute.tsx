import { AuthProvider, MainWrapper, Projects } from '../components';

export function ProjectsRoute() {
  return (
    <MainWrapper>
      <AuthProvider>
        <Projects />
      </AuthProvider>
    </MainWrapper>
  );
}
