import { AuthProvider, MainWrapper, Parameters } from '../components';

export function LayersRoute() {
  return (
    <MainWrapper>
      <AuthProvider>
        <Parameters />
      </AuthProvider>
    </MainWrapper>
  );
}
