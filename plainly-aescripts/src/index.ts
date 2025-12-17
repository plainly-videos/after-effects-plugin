import { collectFiles, selectFolder } from './collect';
import {
  getProjectData,
  getProjectPath,
  removeProjectData,
  saveProject,
  setProjectData,
} from './project';
import { relinkFootage } from './relink';
import './shims';
import { selectLayer } from './utils';
import { fixAllIssues, validateProject } from './validation';

const PlainlyAE = () => ({
  selectFolder,
  collectFiles,
  setProjectData,
  getProjectData,
  removeProjectData,
  getProjectPath,
  saveProject,
  relinkFootage,
  validateProject,
  fixAllIssues,
  selectLayer,
});

if ($['com.plainlyvideos.after-effects-plugin.Panel']) {
  delete $['com.plainlyvideos.after-effects-plugin.Panel'];
}

$['com.plainlyvideos.after-effects-plugin.Panel'] = PlainlyAE();
