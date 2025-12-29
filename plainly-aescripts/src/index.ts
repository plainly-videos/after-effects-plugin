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
import { selectComp, selectLayer, undo, unselectAllLayers } from './utils';
import { fixAllCapsIssues, fixAllIssues, validateProject } from './validation';
import { fixUnsupported3DRendererIssues } from './validation/compValidators';

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
  undo,
};

const validateFunctions = {
  validateProject,
  fixAllIssues,
  fixAllCapsIssues,
  fixUnsupported3DRendererIssues,
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
