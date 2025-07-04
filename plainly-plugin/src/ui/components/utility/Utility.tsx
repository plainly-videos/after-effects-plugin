import { Description, PageHeading } from '../typography';
import { UtilitiesGrid } from './UtilitiesGrid';

export const Utility = () => {
  return (
    <div className="space-y-4 w-full text-white">
      <div>
        <PageHeading heading="Utilities" />
        <Description className="mt-1">
          A set of essential utilities to automate and enhance your After
          Effects workflow.{' '}
          <span className="text-white">
            Please review your project after using these tools as they may have
            changed the project structure!
          </span>
        </Description>
      </div>
      <UtilitiesGrid />
    </div>
  );
};
