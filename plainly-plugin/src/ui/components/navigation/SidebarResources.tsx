import { resources } from '../../routes/pages';
import SidebarLinks from './SidebarLinks';

export default function SidebarResources() {
  return <SidebarLinks links={resources} />;
}
