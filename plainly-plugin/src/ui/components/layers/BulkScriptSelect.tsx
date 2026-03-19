import {
  type EditableScript,
  type Layer,
  ScriptType,
  type TextAutoScaleScript,
} from '@src/ui/types/template';
import { Badge } from '../common/Badge';
import { Description, Label } from '../typography';

export function BulkScriptSelect({
  selectedLayerIds,
  onEditScript,
  setEditableLayers,
}: {
  selectedLayerIds: Set<string>;
  onEditScript: (params: {
    layerInternalId: string;
    script: EditableScript;
    isNew: boolean;
    isBulk: boolean;
  }) => void;
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
            onEditScript({
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
        <Badge
          label="Auto scale media"
          action={() => {
            onEditScript({
              layerInternalId: '',
              script: {
                scriptType: ScriptType.MEDIA_AUTO_SCALE,
                fill: true,
                fixedRatio: true,
              },
              isNew: true,
              isBulk: true,
            });
          }}
          disabled={selectedLayerIds.size === 0}
        />
      </div>
    </div>
  );
}
