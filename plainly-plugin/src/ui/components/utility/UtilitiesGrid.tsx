import { ChangeAnchorPoint, ImageAutoScale, TextAutoScale } from '.';

export const UtilitiesGrid = () => {
  return (
    <div className="relative flex w-full">
      <div className="columns-2 gap-2 w-full">
        <TextAutoScale />
        <ImageAutoScale />
        <ChangeAnchorPoint />
      </div>
    </div>
  );
};
