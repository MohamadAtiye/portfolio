import { Container } from "@mui/material";
import Header from "./components/Header";
import Hero from "./components/Hero";
import Journey from "./components/Journey";

function App() {
  return (
    <>
      <Header />
      <Hero />
      <Container>
        <Journey />
      </Container>
    </>
  );
}

export default App;
