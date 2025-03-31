import { ImageAutoScale, TextAutoScale } from '.';

export const UtilitiesGrid = () => {
  return (
    <div className="grid grid-cols-1 gap-2">
      <TextAutoScale />
      <ImageAutoScale />
    </div>
  );
};
