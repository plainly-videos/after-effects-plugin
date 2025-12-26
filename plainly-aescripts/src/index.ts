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
import { fixAllCapsIssue } from './validation/textValidators';

const collectFunctions = {
  collectFiles,
  selectFolder,
  relinkFootage,
};

const projectFunctions = {
  setProjectData,
  getProjectData,
  removeProjectData,
  getProjectPath,
  saveProject,
  getAfterEffectsVersion,
};

const utilsFunctions = {
  unselectAllLayers,
  selectLayer,
  selectComp,
};

const validateFunctions = {
  validateProject,
  fixAllIssues,
  fixAllCapsIssue,
};

const PlainlyAE = () => ({
  ...collectFunctions,
  ...projectFunctions,
  ...utilsFunctions,
  ...validateFunctions,
});

if ($['com.plainlyvideos.after-effects-plugin.Panel']) {
  delete $['com.plainlyvideos.after-effects-plugin.Panel'];
}

$['com.plainlyvideos.after-effects-plugin.Panel'] = PlainlyAE();
