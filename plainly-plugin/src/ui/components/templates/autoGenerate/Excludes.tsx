import { useCallback } from 'react';
import { Checkbox } from '../../common';

export function Excludes({
  exclude,
  setExclude,
  disabled,
}: {
  exclude: {
    excludeAdjustmentLayers: boolean;
    excludeDisabledLayers: boolean;
    excludeGuideLayers: boolean;
    excludeShyLayers: boolean;
  };
  setExclude: React.Dispatch<
    React.SetStateAction<{
      excludeAdjustmentLayers: boolean;
      excludeDisabledLayers: boolean;
      excludeGuideLayers: boolean;
      excludeShyLayers: boolean;
    }>
  >;
  disabled?: boolean;
}) {
  const handleChange = useCallback(
    (key: keyof typeof exclude) => {
      setExclude((prev) => ({
        ...prev,
        [key]: !prev[key],
      }));
    },
    [setExclude],
  );

  return (
    <>
      <div className="col-span-full">
        <Checkbox
          id="excludeAdjustmentLayers"
          checked={exclude.excludeAdjustmentLayers}
          label="Exclude adjustment layers"
          description="Adjustment layers will not be parametrized."
          onChange={() => handleChange('excludeAdjustmentLayers')}
          disabled={disabled}
        />
      </div>

      <div className="col-span-full">
        <Checkbox
          id="excludeDisabledLayers"
          checked={exclude.excludeDisabledLayers}
          label="Exclude disabled layers"
          description="Disabled layers will not be parametrized."
          onChange={() => handleChange('excludeDisabledLayers')}
          disabled={disabled}
        />
      </div>

      <div className="col-span-full">
        <Checkbox
          id="excludeGuideLayers"
          checked={exclude.excludeGuideLayers}
          label="Exclude guide layers"
          description="Guide layers will not be parametrized."
          onChange={() => handleChange('excludeGuideLayers')}
          disabled={disabled}
        />
      </div>

      <div className="col-span-full">
        <Checkbox
          id="excludeShyLayers"
          checked={exclude.excludeShyLayers}
          label="Exclude shy layers"
          description="Shy layers will not be parametrized."
          onChange={() => handleChange('excludeShyLayers')}
          disabled={disabled}
        />
      </div>
    </>
  );
}
