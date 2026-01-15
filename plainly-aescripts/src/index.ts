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
  getFontsByFamilyNameAndStyleName,
  getFontsByPostScriptName,
} from './utils';

const PlainlyAE = () => ({
  selectFolder,
  collectFiles,
  setProjectData,
  getProjectData,
  removeProjectData,
  getProjectPath,
  saveProject,
  relinkFootage,
  getFontsByPostScriptName,
  getFontsByFamilyNameAndStyleName,
  getAfterEffectsVersion,
});

if ($['com.plainlyvideos.after-effects-plugin.Panel']) {
  delete $['com.plainlyvideos.after-effects-plugin.Panel'];
}

$['com.plainlyvideos.after-effects-plugin.Panel'] = PlainlyAE();
