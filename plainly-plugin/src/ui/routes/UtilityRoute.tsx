import { getSelectedLayers } from '@src/node/utility';
import { Button, MainWrapper } from '../components';

export function UtilityRoute() {
  return (
    <MainWrapper>
      <Button onClick={() => getSelectedLayers()}>Click here</Button>
    </MainWrapper>
  );
}
