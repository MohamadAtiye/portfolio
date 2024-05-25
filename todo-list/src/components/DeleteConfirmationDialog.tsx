import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { Note } from "../hooks/notesContext";

interface DeleteConfirmationDialogProps {
  note: Note;
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}
function DeleteConfirmationDialog({
  note,
  open,
  onClose,
  onConfirm,
}: DeleteConfirmationDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">
        Confirm {note.isDeleted ? "Restore" : "Delete"}
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          {note.isDeleted
            ? "Restore deleted note?"
            : "Are you sure you want to delete this item?"}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={onConfirm} autoFocus>
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default DeleteConfirmationDialog;
