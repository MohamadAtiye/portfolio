import { useMemo } from "react";
import { Paper, Typography } from "@mui/material";
import { useNotes } from "../hooks/useNotes";
import { Note, SortOption } from "../hooks/notesContext";
import NoteRow from "./NoteRow";

const sortNotes = (list: Note[], sortBy: SortOption) => {
  return list.sort((a, b) => {
    switch (sortBy) {
      case "dateAdded":
        return b.dateAdded - a.dateAdded;
      case "lastUpdated":
        return b.lastUpdated - a.lastUpdated;
      default:
        return 0;
    }
  });
};

const StickyHead = ({ text }: { text: string }) => {
  return (
    <Paper
      style={{
        position: "sticky",
        top: 0,
        zIndex: 1,
        padding: "12px 32px",
        color: "white",
        backgroundColor: "black",
      }}
    >
      <Typography>{text}</Typography>
    </Paper>
  );
};

export default function NotesList() {
  const { notes, searchQuery, displaySettings } = useNotes();

  const sortedNotes = useMemo(() => {
    let temp = notes.filter((t) => !t.isCompleted);

    if (!displaySettings.showDeleted) temp = temp.filter((t) => !t.isDeleted);

    if (searchQuery.length)
      temp = temp.filter((t) =>
        t.title.toLowerCase().includes(searchQuery.toLowerCase())
      );

    return sortNotes(temp, displaySettings.sortBy);
  }, [displaySettings.showDeleted, displaySettings.sortBy, notes, searchQuery]);

  const completedNotes = useMemo(() => {
    if (!displaySettings.showCompleted) return [];

    let temp = notes.filter((t) => t.isCompleted);

    if (!displaySettings.showDeleted) temp = temp.filter((t) => !t.isDeleted);

    if (searchQuery.length)
      temp = temp.filter((t) => t.title.includes(searchQuery));

    return sortNotes(temp, displaySettings.sortBy);
  }, [
    displaySettings.showCompleted,
    displaySettings.showDeleted,
    displaySettings.sortBy,
    notes,
    searchQuery,
  ]);

  return (
    <Paper
      elevation={3}
      sx={{
        flex: 1,
        position: "relative",
        padding: "8px 0",
        paddingTop: 0,
        overflowY: "scroll",
        scrollbarWidth: "thin",
        border: "1px solid black",
        display: "flex",
        flexDirection: "column",
        gap: 1,
        bgcolor: "rgba(255,255,255,0.5);",
      }}
    >
      <StickyHead text="Active" />
      {sortedNotes.map((note) => (
        <NoteRow note={note} key={note.id} />
      ))}
      {sortedNotes.length == 0 && (
        <Typography p={2}>
          {searchQuery.length > 0
            ? "No results found, adjust your search"
            : "add a new task..."}
        </Typography>
      )}

      {completedNotes.length > 0 && (
        <>
          <StickyHead text="Completed" />

          {completedNotes.map((note) => (
            <NoteRow note={note} key={note.id} />
          ))}
        </>
      )}
    </Paper>
  );
}
