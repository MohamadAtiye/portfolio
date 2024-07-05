import { Container } from "@mui/material";
import Header from "./components/Header";
import Hero from "./components/Hero";
import Journey from "./components/Journey";
import Profile from "./components/Profile";
import Footer from "./components/Footer";
import ContactForm from "./components/ContactForm";

function App() {
  return (
    <>
      <Header />
      <Hero />
      <Container>
        <Profile />
        <Journey />
        <ContactForm />
      </Container>
      <Footer />
    </>
  );
}

export default App;
