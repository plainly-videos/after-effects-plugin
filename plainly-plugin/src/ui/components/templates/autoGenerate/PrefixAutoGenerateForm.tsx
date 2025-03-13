import { AutoCreateTemplateType } from '@src/ui/types/template';
import { useEffect, useState } from 'react';
import { Excludes, type FormProps, TargetCompositionName } from '.';
import { Checkbox } from '../../common';
import { Description, Label } from '../../typography';

export function PrefixAutoGenerateForm({ setData, projectId }: FormProps) {
  const [prefixes, setPrefixes] = useState<string[]>();
  const [stripPrefix, setStripPrefix] = useState(false);
  const [targetCompositionName, setTargetCompositionName] = useState<string>();
  const [exclude, setExclude] = useState({
    excludeAdjustmentLayers: false,
    excludeDisabledLayers: false,
    excludeGuideLayers: false,
    excludeShyLayers: false,
  });

  useEffect(() => {
    setData({
      type: AutoCreateTemplateType.prefix,
      prefixes: prefixes?.map((prefix) => prefix.trim()),
      stripPrefix,
      targetCompositionName: targetCompositionName || undefined,
      excludeAdjustmentLayers: exclude.excludeAdjustmentLayers,
      excludeDisabledLayers: exclude.excludeDisabledLayers,
      excludeGuideLayers: exclude.excludeGuideLayers,
      excludeShyLayers: exclude.excludeShyLayers,
    });
  }, [
    prefixes,
    stripPrefix,
    setData,
    targetCompositionName,
    exclude.excludeAdjustmentLayers,
    exclude.excludeDisabledLayers,
    exclude.excludeGuideLayers,
    exclude.excludeShyLayers,
  ]);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-6">
      <TargetCompositionName
        targetCompositionName={targetCompositionName}
        setTargetCompositionName={setTargetCompositionName}
        projectId={projectId}
      />

      <div className="col-span-full">
        <Label label="Prefixes" htmlFor="prefixes" />
        <Description className="mb-1">
          Comma separated list of prefixes that will be used to filter
          compositions and layers for auto parametrization. If not provided, we
          will look for <code className="text-xs text-white">plainly</code>
          prefix in your project.
        </Description>
        <input
          id="prefixes"
          name="prefixes"
          type="text"
          className="col-start-1 row-start-1 block w-full rounded-md bg-white/5 px-3 py-1 text-xs text-white outline outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500"
          defaultValue={prefixes?.join(',')}
          onChange={(e) => setPrefixes(e.target.value.split(','))}
          placeholder="Enter prefixes"
        />
      </div>

      <div className="col-span-full">
        <Checkbox
          id="stripPrefix"
          checked={stripPrefix}
          label="Strip prefix"
          description="Prefix will be stripped from the composition and layer names when templates are created and auto parametrization is done."
          onChange={setStripPrefix}
        />
      </div>

      <Excludes exclude={exclude} setExclude={setExclude} />
    </div>
  );
}
