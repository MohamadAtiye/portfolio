import { Container } from "@mui/material";
import Header from "./components/Header";
import Hero from "./components/Hero";
import Journey from "./components/Journey";
import Profile from "./components/Profile";

function App() {
  return (
    <>
      <Header />
      <Hero />
      <Container>
        <Profile />
        <Journey />
      </Container>
    </>
  );
}

export default App;
