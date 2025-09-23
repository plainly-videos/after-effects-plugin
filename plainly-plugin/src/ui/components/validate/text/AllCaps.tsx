import React from 'react';

export function AllCaps({
  allCaps,
}: {
  allCaps: {
    layerId: string;
    layerName: string;
  }[];
}) {
  return (
    <div className="col-span-3 grid grid-cols-3">
      {allCaps?.map((details) => (
        <React.Fragment key={details.layerId}>
          <div className="col-span-1 border-r border-white/10 px-1 py-1">
            <p>allCaps</p>
          </div>
          <div className="col-span-2 px-1 py-1 w-full">
            <p className="text-left">{details.layerName}</p>
          </div>
        </React.Fragment>
      ))}
    </div>
  );
}
