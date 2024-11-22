import { createLazyFileRoute } from '@tanstack/react-router';
import ExportForm from '../components/form/ExportForm';
import MainWrapper from '../components/layout/MainWrapper';

export const Route = createLazyFileRoute('/export')({
  component: Export,
});

export function Export() {
  return (
    <MainWrapper>
      <ExportForm />
    </MainWrapper>
  );
}
