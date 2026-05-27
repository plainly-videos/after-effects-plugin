import type { ScriptType } from '@src/ui/types/template';
import { ChoiceDialog, type ChoiceDialogOption } from '../common';
import { SCRIPT_REGISTRY } from './scriptRegistry';

export function TimelineScriptsDialog({
  open,
  setOpen,
  selectionCount,
  onSelect,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  selectionCount: number;
  onSelect: (scriptType: ScriptType) => void;
}) {
  const options: ChoiceDialogOption[] = (
    Object.keys(SCRIPT_REGISTRY) as ScriptType[]
  )
    .filter((type) => SCRIPT_REGISTRY[type].isAddable)
    .filter((type) =>
      selectionCount >= 2 ? SCRIPT_REGISTRY[type].isBulkable : true,
    )
    .map((type) => {
      const { label, description, icon: Icon } = SCRIPT_REGISTRY[type];
      return {
        id: type,
        label,
        description,
        icon: <Icon className="size-4 text-white" />,
      };
    });

  const title =
    selectionCount > 1
      ? `Add script to ${selectionCount} selected layers`
      : 'Add script to selected layer';
  const description =
    selectionCount > 1
      ? 'Select a script to add to the timeline-selected layers. Layers whose type is not compatible with the chosen script will be skipped.'
      : 'Select a script to add to the timeline-selected layer.';

  return (
    <ChoiceDialog
      open={open}
      title={title}
      description={description}
      options={options}
      onSelect={(id) => {
        onSelect(id as ScriptType);
        setOpen(false);
      }}
      onCancel={() => setOpen(false)}
    />
  );
}
