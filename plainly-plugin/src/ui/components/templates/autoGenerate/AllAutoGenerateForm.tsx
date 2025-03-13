import { AutoCreateTemplateType } from '@src/ui/types/template';
import { useEffect, useState } from 'react';
import { Excludes, type FormProps, TargetCompositionName } from '.';
import { Checkbox } from '../../common';

export function AllAutoGenerateForm({ setData, projectId }: FormProps) {
  const [allLayers, setAllLayers] = useState(false);
  const [greedy, setGreedy] = useState(false);
  const [targetCompositionName, setTargetCompositionName] = useState<string>();
  const [exclude, setExclude] = useState({
    excludeAdjustmentLayers: false,
    excludeDisabledLayers: false,
    excludeGuideLayers: false,
    excludeShyLayers: false,
  });

  useEffect(() => {
    setData({
      type: AutoCreateTemplateType.all,
      allLayers,
      greedy,
      targetCompositionName: targetCompositionName || undefined,
      excludeAdjustmentLayers: exclude.excludeAdjustmentLayers,
      excludeDisabledLayers: exclude.excludeDisabledLayers,
      excludeGuideLayers: exclude.excludeGuideLayers,
      excludeShyLayers: exclude.excludeShyLayers,
    });
  }, [
    allLayers,
    exclude.excludeAdjustmentLayers,
    exclude.excludeDisabledLayers,
    exclude.excludeGuideLayers,
    exclude.excludeShyLayers,
    greedy,
    setData,
    targetCompositionName,
  ]);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-6">
      <TargetCompositionName
        targetCompositionName={targetCompositionName}
        setTargetCompositionName={setTargetCompositionName}
        projectId={projectId}
      />

      <div className="col-span-full">
        <Checkbox
          id="greedy"
          checked={greedy}
          label="Greedy"
          description="Creates a single template for all root compositions, or only for the one with the most sub-layers if multiple exist. Ignored if a specific target composition is selected."
          onChange={setGreedy}
        />
      </div>

      <div className="col-span-full">
        <Checkbox
          id="allLayers"
          checked={allLayers}
          label="All layers"
          description="Includes all text and media layers in the composition tree for auto-parametrization. Otherwise, no layers will be parametrized."
          onChange={setAllLayers}
        />
      </div>

      <Excludes
        exclude={exclude}
        setExclude={setExclude}
        disabled={!allLayers}
      />
    </div>
  );
}
