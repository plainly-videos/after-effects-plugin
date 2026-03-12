import {
  type CropScript,
  type Layer,
  ScriptType,
  type TextAutoScaleScript,
} from '@src/ui/types/template';
import { Badge } from '../common/Badge';
import { Description, Label } from '../typography';

export function BulkScriptSelect({
  selectedLayerIds,
  setActiveCropEdit,
  setEditableLayers,
}: {
  selectedLayerIds: Set<string>;
  setActiveCropEdit: React.Dispatch<
    React.SetStateAction<{
      layerInternalId: string;
      script: CropScript;
      isNew: boolean;
      isBulk: boolean;
    } | null>
  >;
  setEditableLayers: React.Dispatch<React.SetStateAction<Layer[]>>;
}) {
  return (
    <div className="col-span-full">
      <Label label="Bulk add new scripts" />
      <Description className="mt-1">
        Select multiple layers from the parametrized layers list and add scripts
        to them in bulk.
      </Description>
      <div className="flex flex-wrap gap-1 mt-1">
        <Badge
          label="Crop"
          action={() =>
            setActiveCropEdit({
              layerInternalId: '',
              script: {
                scriptType: ScriptType.CROP,
                compEndsAtOutPoint: false,
                compStartsAtInPoint: false,
              },
              isNew: true,
              isBulk: true,
            })
          }
          disabled={selectedLayerIds.size === 0}
        />
        <Badge
          label="Auto scale text"
          action={() => {
            setEditableLayers((prev) =>
              prev.map((layer) => {
                if (!selectedLayerIds.has(layer.internalId)) return layer;
                const existingScripts = layer.scripting?.scripts || [];
                const hasAutoScaleText = existingScripts.some(
                  (s) => s.scriptType === ScriptType.TEXT_AUTO_SCALE,
                );
                if (hasAutoScaleText) return layer;
                const updatedScript: TextAutoScaleScript = {
                  scriptType: ScriptType.TEXT_AUTO_SCALE,
                };
                return {
                  ...layer,
                  scripting: {
                    ...layer.scripting,
                    scripts: [...existingScripts, updatedScript],
                  },
                };
              }),
            );
          }}
          disabled={selectedLayerIds.size === 0}
        />
      </div>
    </div>
  );
}
