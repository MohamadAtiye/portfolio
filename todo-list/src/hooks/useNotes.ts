import { useContext } from "react";
import { NoteToEdit, NotesContext } from "./notesContext";

// Custom hook to access the notes context
export function useNotes() {
  return useContext(NotesContext);
}

export const defaultNoteToEdit: NoteToEdit = {
  id: undefined,
  title: "",
  content: "",
  isCompleted: false,
  isDeleted: false,
};
