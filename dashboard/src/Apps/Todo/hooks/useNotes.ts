import { useContext } from "react";
import { NotesContext } from "./notesContext";

export function useNotes() {
  return useContext(NotesContext);
}