import { AuthProvider, Layers, MainWrapper } from '../components';

export function LayersRoute() {
  return (
    <MainWrapper>
      <AuthProvider>
        <Layers />
      </AuthProvider>
    </MainWrapper>
  );
}
