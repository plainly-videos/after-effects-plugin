import { AuthProvider, MainWrapper, Parametrization } from '../components';

export function ParametrizationRoute() {
  return (
    <MainWrapper>
      <AuthProvider>
        <Parametrization />
      </AuthProvider>
    </MainWrapper>
  );
}
