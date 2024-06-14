// Define the type for a single note
export type Note = {
  id: string;
  title: string;
  content: string;

  isCompleted: boolean;
  isDeleted: boolean;

  lastUpdated: number;
  dateAdded: number;
};

export type NoteToEdit = {
  id?: string;
  title: string;
  content: string;
  isCompleted: boolean;
  isDeleted: boolean;
};

export type SortOption = "dateAdded" | "lastUpdated";

export const DEFAULT_DISPLAY_SETTINGS = {
  showDeleted: false,
  showCompleted: true,
  sortBy: "dateAdded" as SortOption,
};

export const defaultNoteToEdit: NoteToEdit = {
  id: undefined,
  title: "",
  content: "",
  isCompleted: false,
  isDeleted: false,
};
