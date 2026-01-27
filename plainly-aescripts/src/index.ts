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
import {
  getInstalledFontsByFamilyNameAndStyleName,
  getInstalledFontsByPostScriptName,
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
  getInstalledFontsByPostScriptName,
  getInstalledFontsByFamilyNameAndStyleName,
});

if ($['com.plainlyvideos.after-effects-plugin.Panel']) {
  delete $['com.plainlyvideos.after-effects-plugin.Panel'];
}

$['com.plainlyvideos.after-effects-plugin.Panel'] = PlainlyAE();
