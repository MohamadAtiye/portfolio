import { Box } from "@mui/material";
import AddTaskBox from "./components/AddTaskBox";
import ControlsBarContainer from "./components/ControlsBarContainer";
import NoteDialogEditor from "./components/NoteDialogEditor";
import NotesList from "./components/NotesList";
import OptionsMenu from "./components/OptionsMenu";
import SearchBox from "./components/SearchBox";
import { NotesProvider } from "./hooks/notesContext";

export default function Todo() {
  return (
    <NotesProvider>
      <Box
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          gap: 1,
        }}
      >
        <ControlsBarContainer>
          <SearchBox />
          <OptionsMenu />
        </ControlsBarContainer>

        <NotesList />

        <AddTaskBox />

        <NoteDialogEditor />
      </Box>
    </NotesProvider>
  );
}
