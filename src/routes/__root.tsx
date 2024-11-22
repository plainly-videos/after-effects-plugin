import { Outlet, createRootRoute } from '@tanstack/react-router';
import Sidebar from '../components/navigation/Sidebar';

export const Route = createRootRoute({
  component: () => (
    <>
      <Sidebar />
      <Outlet />
    </>
  ),
});
