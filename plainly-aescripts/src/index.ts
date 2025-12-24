import { collectFiles, selectFolder } from './collect';
import {
  getAfterEffectsVersion,
  getProjectData,
  getProjectPath,
  removeProjectData,
  saveProject,
  setProjectData,
} from './project';
import { relinkFootage } from './relink';
import './shims';
import { selectComp, selectLayer, unselectAllLayers } from './utils';
import { fixAllIssues, validateProject } from './validation';

const PlainlyAE = () => ({
  selectFolder,
  collectFiles,
  setProjectData,
  getProjectData,
  removeProjectData,
  getProjectPath,
  saveProject,
  getAfterEffectsVersion,
  relinkFootage,
  validateProject,
  fixAllIssues,
  unselectAllLayers,
  selectLayer,
  selectComp,
});

if ($['com.plainlyvideos.after-effects-plugin.Panel']) {
  delete $['com.plainlyvideos.after-effects-plugin.Panel'];
}

$['com.plainlyvideos.after-effects-plugin.Panel'] = PlainlyAE();
