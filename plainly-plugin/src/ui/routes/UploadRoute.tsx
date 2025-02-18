import UploadForm from '../components/form/UploadForm';
import MainWrapper from '../components/layout/MainWrapper';
import { AuthProvider } from '../components/settings/AuthProvider';

export function UploadRoute() {
  return (
    <MainWrapper>
      <AuthProvider>
        <UploadForm />
      </AuthProvider>
    </MainWrapper>
  );
}
