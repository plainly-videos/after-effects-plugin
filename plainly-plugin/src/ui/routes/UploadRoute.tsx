import { AuthProvider, MainWrapper, UploadForm } from '../components';

export function UploadRoute() {
  return (
    <MainWrapper>
      <AuthProvider>
        <UploadForm />
      </AuthProvider>
    </MainWrapper>
  );
}
