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
import {
  getAllVideoLayersInComp,
  getCompLayerNames,
  getInstalledFontsByFamilyNameAndStyleName,
  getInstalledFontsByPostScriptName,
  getSelectedLayers,
  selectComp,
  selectFile,
  selectLayer,
} from './utils';
import { fixAllIssues, validateProject } from './validation';
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
  getInstalledFontsByPostScriptName,
  getInstalledFontsByFamilyNameAndStyleName,
};

const utilsFunctions = {
  selectLayer,
  selectComp,
  selectFile,
  getCompLayerNames,
  getSelectedLayers,
  getAllVideoLayersInComp,
};

const validateFunctions = {
  validateProject,
  fixAllIssues,
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
