import React, { createContext, useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import {
  DEFAULT_DISPLAY_SETTINGS,
  Note,
  NoteToEdit,
  SortOption,
} from "../helpers/types";

// Create a context for the notes
export const NotesContext = createContext<{
  notes: Note[];
  noteToEdit: NoteToEdit | undefined;
  editNote: (note: NoteToEdit | undefined) => void;
  updateNote: (note: NoteToEdit) => void;
  addNote: (note: NoteToEdit) => void;
  displaySettings: {
    showDeleted: boolean;
    showCompleted: boolean;
    sortBy: SortOption;
  };
  searchQuery: string;
  setSearchQuery: (s: string) => void;
  setDisplaySettings: React.Dispatch<
    React.SetStateAction<{
      showDeleted: boolean;
      showCompleted: boolean;
      sortBy: SortOption;
    }>
  >;
}>({
  notes: [],
  noteToEdit: undefined,
  editNote: () => {},
  updateNote: () => {},
  addNote: () => {},
  displaySettings: DEFAULT_DISPLAY_SETTINGS,
  searchQuery: "",
  setSearchQuery: () => {},
  setDisplaySettings: () => {},
});

const NOTES_STORAGE = "myNotes";
const DISPLAY_STORAGE = "myDisplaySettings";

// NotesProvider component to wrap app
export function NotesProvider({ children }: { children: React.ReactNode }) {
  const [notes, setNotes] = useState<Note[]>(
    JSON.parse(localStorage.getItem(NOTES_STORAGE) ?? "[]")
  );
  const [noteToEdit, setNoteToEdit] = useState<NoteToEdit>();

  const [displaySettings, setDisplaySettings] = useState(() => {
    const s = localStorage.getItem(DISPLAY_STORAGE);
    return s ? JSON.parse(s) : DEFAULT_DISPLAY_SETTINGS;
  });
  const [searchQuery, setSearchQuery] = useState("");

  // mark note to be edited. new notes id=undefined
  const editNote = (note: NoteToEdit | undefined) => {
    if (!note) return setNoteToEdit(undefined);
    setNoteToEdit({
      id: note.id,
      title: note.title.trim() ?? "",
      content: note.content.trim() ?? "",
      isCompleted: note.isCompleted ?? false,
      isDeleted: note.isDeleted ?? false,
    });
  };

  const updateNote = (note: NoteToEdit) => {
    const temp = [...notes];
    const toUpdate = temp.find((t) => t.id === note.id);
    if (!toUpdate) return;

    toUpdate.title = note.title.trim();
    toUpdate.content = note.content.trim();
    toUpdate.isCompleted = note.isCompleted;
    toUpdate.isDeleted = note.isDeleted;
    toUpdate.lastUpdated = Date.now();

    setNotes(temp);
    setNoteToEdit(undefined);
  };

  const addNote = (note: NoteToEdit) => {
    const id = uuidv4();

    setNotes((prevNotes) => [
      {
        id,
        title: note.title.trim(),
        content: note.content.trim(),
        isCompleted: note.isCompleted,

        isDeleted: false,
        lastUpdated: Date.now(),
        dateAdded: Date.now(),
      },
      ...prevNotes,
    ]);
  };

  // write changes to local storage
  useEffect(() => {
    localStorage.setItem(DISPLAY_STORAGE, JSON.stringify(displaySettings));
    console.log("saved settings");
  }, [displaySettings]);

  useEffect(() => {
    localStorage.setItem(NOTES_STORAGE, JSON.stringify(notes));
    console.log("saved notes");
  }, [notes]);

  return (
    <NotesContext.Provider
      value={{
        notes,
        noteToEdit,
        editNote,
        updateNote,
        addNote,
        displaySettings,
        searchQuery,
        setSearchQuery,
        setDisplaySettings,
      }}
    >
      {children}
    </NotesContext.Provider>
  );
}
