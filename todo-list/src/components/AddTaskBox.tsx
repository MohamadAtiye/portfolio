import { useEffect, useRef, useState } from "react";
import { defaultNoteToEdit, useNotes } from "../hooks/useNotes";
import { Box, IconButton, InputAdornment, TextField } from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import AddIcon from "@mui/icons-material/Add";
import { NoteToEdit } from "../hooks/notesContext";

export default function AddTaskBox() {
  const { addNote, editNote } = useNotes();
  const inputReference = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<NoteToEdit>({
    ...defaultNoteToEdit,
  });
  useEffect(() => {
    inputReference.current?.focus();
  }, []);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    setFormData((f) => ({ ...f, title: newValue }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    addNote(formData);
    setFormData({ ...defaultNoteToEdit });

    inputReference.current?.focus();
  };

  return (
    <Box
      component={"form"}
      onSubmit={handleSubmit}
      mt={1}
      sx={{
        borderRadius: "5px",
        overflow: "hidden",
      }}
      id={"add-note-bar"}
    >
      <TextField
        sx={{
          bgcolor: "white",
        }}
        fullWidth
        placeholder="I want to..."
        value={formData.title}
        onChange={handleChange}
        inputRef={inputReference}
        autoComplete="off"
        required
        InputProps={{
          endAdornment: (
            <>
              <InputAdornment position="end">
                <IconButton
                  size="large"
                  onClick={() => {
                    editNote(formData);
                    setFormData({ ...defaultNoteToEdit });
                  }}
                  edge="end"
                >
                  <AddIcon />
                </IconButton>
              </InputAdornment>
              {formData.title.trim().length > 0 && (
                <InputAdornment position="end">
                  <IconButton
                    size="large"
                    onClick={() =>
                      setFormData((f) => ({
                        ...f,
                        title: f.title.trim(),
                        content: f.content.trim(),
                      }))
                    }
                    type="submit"
                    form="add-note-bar"
                    edge="end"
                  >
                    <CheckIcon />
                  </IconButton>
                </InputAdornment>
              )}
            </>
          ),
        }}
      />
    </Box>
  );
}
