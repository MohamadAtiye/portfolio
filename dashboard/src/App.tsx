import { Box } from "@mui/material";
import Header from "./components/Header";
import PagePaper from "./components/PagePaper";
import { useDashboard } from "./hooks/useDashboard";

function App() {
  const { activeApp } = useDashboard();
  return (
    <Box px={2}>
      <Header />
      <PagePaper>{activeApp}</PagePaper>
    </Box>
  );
}

export default App;
