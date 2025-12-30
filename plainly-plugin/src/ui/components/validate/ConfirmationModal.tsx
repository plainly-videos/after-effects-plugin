import { ConfirmationDialog } from '../common';

export function ConfirmationModal({
  open,
  setOpen,
  onConfirm,
  affectedCount,
  readMoreLink,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  onConfirm: () => void;
  affectedCount: number;
  readMoreLink: string;
}) {
  const countLabel =
    affectedCount === 1
      ? 'this composition'
      : affectedCount > 1
        ? `these ${affectedCount} compositions`
        : 'the affected compositions';

  return (
    <ConfirmationDialog
      title="Fix unsupported 3D renderer"
      description={`Fixing will switch the renderer for ${countLabel} to Classic 3D. This can change the look of 3D layers, but you can undo the fix from the validations list. Usage of non-Classic 3D renderers is not supported by Plainly, so it is recommended to move back to Classic 3D, or find alternative solutions for the effects you are using.`}
      buttonText="Switch to Classic 3D"
      open={open}
      setOpen={setOpen}
      action={onConfirm}
      readMoreLink={readMoreLink}
    />
  );
}
