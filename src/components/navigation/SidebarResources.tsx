import { resources } from '../../routes/pages';
import SidebarLinks from './SidebarLinks';

export default function SidebarResources({
  sidebarOpen,
}: { sidebarOpen: boolean }) {
  return <SidebarLinks links={resources} sidebarOpen={sidebarOpen} />;
}
