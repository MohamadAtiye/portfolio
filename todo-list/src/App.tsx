import ControlsBarContainer from "./components/ControlsBarContainer";
import Header from "./components/Header";
import ListContainer from "./components/ListContainer";
import { useNotes } from "./hooks/useNotes";
import NoteRow from "./components/NoteRow";
import AppContainer from "./components/AppContainer";
import AddTaskBox from "./components/AddTaskBox";
import { useMemo, useState } from "react";
import SearchBox from "./components/SearchBox";
import OptionsMenu, { SortOption } from "./components/OptionsMenu";
import { Note } from "./hooks/notesContext";
import { Paper, Typography } from "@mui/material";
import NoteDialogEditor from "./components/NoteDialogEditor";

//DONE // TODO search
//DONE // TODO sort

// TODO dueDate
// TODO add notes history
// TODO subTasks
// TODO catergories

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

function App() {
  const { notes } = useNotes();

  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("dateAdded");

  const [showDeleted, setShowDeleted] = useState(false);
  const [showCompleted, setShowCompleted] = useState(true);

  const sortedNotes = useMemo(() => {
    let temp = notes.filter((t) => !t.isCompleted);

    if (!showDeleted) temp = temp.filter((t) => !t.isDeleted);

    if (searchQuery.length)
      temp = temp.filter((t) =>
        t.title.toLowerCase().includes(searchQuery.toLowerCase())
      );

    return sortNotes(temp, sortBy);
  }, [notes, searchQuery, showDeleted, sortBy]);

  const completedNotes = useMemo(() => {
    if (!showCompleted) return [];

    let temp = notes.filter((t) => t.isCompleted);

    if (!showDeleted) temp = temp.filter((t) => !t.isDeleted);

    if (searchQuery.length)
      temp = temp.filter((t) => t.title.includes(searchQuery));

    return sortNotes(temp, sortBy);
  }, [notes, searchQuery, showCompleted, showDeleted, sortBy]);

  return (
    <AppContainer>
      <Header />

      <ControlsBarContainer>
        <SearchBox searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

        <OptionsMenu
          sortBy={sortBy}
          setSortBy={setSortBy}
          showCompleted={showCompleted}
          showDeleted={showDeleted}
          onShowCompleted={() => setShowCompleted((v) => !v)}
          onShowDeleted={() => setShowDeleted((v) => !v)}
        />
      </ControlsBarContainer>

      <ListContainer>
        <Paper
          style={{
            position: "sticky",
            top: 0,
            zIndex: 1,
            padding: "12px 32px",
            color: "white",
            backgroundColor: "gray",
          }}
        >
          <Typography>Active</Typography>
        </Paper>
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
            <Paper
              style={{
                position: "sticky",
                top: 0,
                zIndex: 1,
                padding: "12px 32px",
                color: "white",
                backgroundColor: "gray",
              }}
            >
              <Typography>Completed</Typography>
            </Paper>
            {completedNotes.map((note) => (
              <NoteRow note={note} key={note.id} />
            ))}
          </>
        )}
      </ListContainer>

      <AddTaskBox />

      <NoteDialogEditor />
    </AppContainer>
  );
}

export default App;
