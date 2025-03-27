import { evalScriptAsync } from '../utils';

async function getSelectedLayers() {
  const result = await evalScriptAsync('getSelectedLayers()');
  console.log(result);
}

export { getSelectedLayers };
