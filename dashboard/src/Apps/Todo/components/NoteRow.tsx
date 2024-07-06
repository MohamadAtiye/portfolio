import { Box, Checkbox, Paper, Typography, IconButton } from "@mui/material";
import { useNotes } from "../hooks/useNotes";

import DeleteIcon from "@mui/icons-material/Delete";
import RestoreFromTrashIcon from "@mui/icons-material/RestoreFromTrash";

import { useState } from "react";
import DeleteConfirmationDialog from "./DeleteConfirmationDialog";
import { Note } from "../helpers/types";

interface NoteRowProps {
  note: Note;
}
export default function NoteRow({ note }: NoteRowProps) {
  const { editNote, updateNote } = useNotes();

  const handleCheck = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateNote({ ...note, isCompleted: e.target.checked });
  };

  const [isDeleteConfirm, setIsDeleteConfirm] = useState(false);

  const handleDeleteConfirm = () => {
    updateNote({ ...note, isDeleted: !note.isDeleted });
    setIsDeleteConfirm(false);
  };

  return (
    <>
      <Paper
        elevation={3}
        sx={{
          display: "flex",
          gap: 1,
          backgroundColor: note.isDeleted
            ? "rgba(0,0,0,0.2);"
            : "rgba(255,255,255,0.2);",
          cursor: "pointer",
          margin: "0 8px",
          transition: "background-color 0.3s",
          "&:hover": {
            backgroundColor: !note.isDeleted ? "lightBlue" : undefined,
          },
        }}
        onClick={() => {
          editNote(note);
        }}
      >
        <Checkbox
          checked={note.isCompleted}
          onClick={(e) => e.stopPropagation()}
          onChange={handleCheck}
          disabled={note.isDeleted}
        ></Checkbox>

        <Box sx={{ flex: 1 }}>
          <Typography
            sx={note.isDeleted ? { textDecoration: "line-through" } : {}}
          >
            {note.title}
          </Typography>
          <Typography variant="caption">
            {new Date(note.lastUpdated).toLocaleString()}
          </Typography>
        </Box>

        {/* DELETE/RESTORE BUTTON */}
        <IconButton
          onClick={(e) => {
            e.stopPropagation();
            setIsDeleteConfirm(true);
          }}
          aria-label="delete"
          title={note.isDeleted ? "Restore" : "Delete"}
        >
          {note.isDeleted ? <RestoreFromTrashIcon /> : <DeleteIcon />}
        </IconButton>
      </Paper>

      <DeleteConfirmationDialog
        note={note}
        open={isDeleteConfirm}
        onClose={() => setIsDeleteConfirm(false)}
        onConfirm={handleDeleteConfirm}
      />
    </>
  );
}
