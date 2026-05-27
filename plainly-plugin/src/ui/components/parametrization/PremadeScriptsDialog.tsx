import { ChoiceDialog, type ChoiceDialogOption } from '../common';
import { PREMADE_SCRIPT_REGISTRY } from './scriptRegistry';

export function PremadeScriptsDialog({
  open,
  setOpen,
  onSelect,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  onSelect: (scriptId: string) => void;
}) {
  const options: ChoiceDialogOption[] = Object.keys(
    PREMADE_SCRIPT_REGISTRY,
  ).map((id) => {
    const { label, description, icon: Icon } = PREMADE_SCRIPT_REGISTRY[id];
    return {
      id,
      label,
      description,
      icon: <Icon className="size-4 text-white" />,
    };
  });

  return (
    <ChoiceDialog
      open={open}
      title="Add script"
      description="Select a script to add to this layer."
      options={options}
      onSelect={(id) => {
        onSelect(id);
        setOpen(false);
      }}
      onCancel={() => setOpen(false)}
    />
  );
}
