import { useContext } from "react";
import { NoteToEdit, NotesContext } from "./notesContext";

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
