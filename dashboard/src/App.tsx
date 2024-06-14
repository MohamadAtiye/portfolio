import { Box } from "@mui/material";
import Header from "./components/Header";
import PagePaper from "./components/PagePaper";

function App() {
  return (
    <Box px={2}>
      <Header />
      <PagePaper>page contents</PagePaper>
    </Box>
  );
}

export default App;
