import { AuthProvider, MainWrapper, Parameters } from '../components';

export function ParametersRoute() {
  return (
    <MainWrapper>
      <AuthProvider>
        <Parameters />
      </AuthProvider>
    </MainWrapper>
  );
}
