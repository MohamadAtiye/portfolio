import ControlsBarContainer from "./components/ControlsBarContainer";
import Header from "./components/Header";
import NotesList from "./components/NotesList";
import AppContainer from "./components/AppContainer";
import AddTaskBox from "./components/AddTaskBox";
import SearchBox from "./components/SearchBox";
import OptionsMenu from "./components/OptionsMenu";
import NoteDialogEditor from "./components/NoteDialogEditor";

function App() {
  return (
    <AppContainer>
      <Header />

      <ControlsBarContainer>
        <SearchBox />
        <OptionsMenu />
      </ControlsBarContainer>

      <NotesList />

      <AddTaskBox />

      <NoteDialogEditor />
    </AppContainer>
  );
}

export default App;
