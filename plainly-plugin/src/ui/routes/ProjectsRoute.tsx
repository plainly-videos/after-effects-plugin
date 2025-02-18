import { Projects } from '../components';
import MainWrapper from '../components/layout/MainWrapper';
import { AuthProvider } from '../components/settings/AuthProvider';

export function ProjectsRoute() {
  return (
    <MainWrapper>
      <AuthProvider>
        <Projects />
      </AuthProvider>
    </MainWrapper>
  );
}
