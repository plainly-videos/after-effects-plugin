import { ConfirmationDialog } from '../common';

export function ConfirmationModal({
  title,
  description,
  buttonText,
  open,
  setOpen,
  onConfirm,
  readMoreLink,
}: {
  title: string;
  description: string;
  buttonText: string;
  open: boolean;
  setOpen: (open: boolean) => void;
  onConfirm: () => void;
  readMoreLink: string;
}) {
  return (
    <ConfirmationDialog
      title={title}
      description={description}
      buttonText={buttonText}
      open={open}
      setOpen={setOpen}
      action={onConfirm}
      readMoreLink={readMoreLink}
    />
  );
}
