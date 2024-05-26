import React, { useEffect, useMemo, useRef, useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import { Box, Checkbox, FormControlLabel } from "@mui/material";
import { defaultNoteToEdit, useNotes } from "../hooks/useNotes";
import { NoteToEdit } from "../hooks/notesContext";

const NoteDialogEditor = () => {
  const { noteToEdit, editNote, updateNote, addNote } = useNotes();
  const inputReference = useRef<HTMLInputElement>(null);

  const isOpen = useMemo(() => !!noteToEdit, [noteToEdit]);
  useEffect(() => {
    isOpen && setTimeout(() => inputReference.current?.focus(), 100);
  }, [isOpen]);
  const noteEditId = noteToEdit?.id ?? undefined;

  const [formData, setFormData] = useState<NoteToEdit>({
    ...defaultNoteToEdit,
  });

  useEffect(() => {
    setFormData(
      noteToEdit ?? {
        ...defaultNoteToEdit,
      }
    );
  }, [noteToEdit]);

  const onClose = () => {
    editNote(undefined);
  };

  const handleChange = (field: string, value: unknown) => {
    setFormData((f) => ({ ...f, [field]: value }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (noteEditId) {
      //update note
      updateNote(formData);
    } else {
      //create new note
      addNote(formData);
    }

    onClose();
  };

  const status = useMemo(() => {
    if (!noteToEdit?.id) return " - New Note";

    if (noteToEdit.isDeleted && !formData.isDeleted) {
      return " - Will Restore";
    }

    if (!noteToEdit.isDeleted && formData.isDeleted) {
      return " - Will Delete";
    }
  }, [formData.isDeleted, noteToEdit?.id, noteToEdit?.isDeleted]);

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      // sx={{
      //   "& .MuiPaper-root": { backgroundColor: "rgb(180,180,180)" },
      // }}
    >
      <DialogTitle>Enter Details {status}</DialogTitle>
      <DialogContent>
        <Box
          component={"form"}
          onSubmit={handleSubmit}
          id={"note-editor-dialog"}
          sx={{ display: "flex", flexDirection: "column", gap: 2 }}
        >
          <TextField
            placeholder="I want to..."
            autoComplete="off"
            fullWidth
            inputRef={inputReference}
            value={formData.title}
            onChange={(event) => handleChange("title", event.target.value)}
            required
          />
          <TextField
            label="Content"
            autoComplete="off"
            fullWidth
            multiline
            rows={4}
            value={formData.content}
            onChange={(event) => handleChange("content", event.target.value)}
          />
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData?.isCompleted}
                  onChange={(event) =>
                    handleChange("isCompleted", event.target.checked)
                  }
                  inputProps={{ "aria-label": "isCompleted checkbox" }}
                />
              }
              label="Task Completed"
            />

            {!!formData.id && (
              <Button
                onClick={() => handleChange("isDeleted", !formData.isDeleted)}
                color="error"
              >
                {formData.isDeleted ? "Restore" : "Delete"}
              </Button>
            )}
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cancel
        </Button>
        <Button
          onClick={() =>
            setFormData((f) => ({
              ...f,
              title: f.title.trim(),
              content: f.content.trim(),
            }))
          }
          type="submit"
          color="primary"
          form="note-editor-dialog"
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default NoteDialogEditor;
