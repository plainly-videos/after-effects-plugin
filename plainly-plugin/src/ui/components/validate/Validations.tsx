import { useContext } from 'react';
import { GlobalContext } from '../context';
import { Description, PageHeading } from '../typography';
import { TextLayersList } from './TextLayersList';

export function Validations() {
  const { projectIssues } = useContext(GlobalContext) || {};
  const textLayers = projectIssues?.filter((issue) => issue.text === true);

  return (
    <div className="space-y-4 w-full text-white">
      <div>
        <PageHeading heading="Project validations" />
        <Description className="mt-1">
          Here you can see potential issues with your project that might cause
          problems when used on the Plainly platform.
        </Description>
      </div>
      <TextLayersList textLayers={textLayers} />
    </div>
  );
}
