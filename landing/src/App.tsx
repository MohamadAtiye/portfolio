import { Container } from "@mui/material";
import Header from "./components/Header";
import Hero from "./components/Hero";
import Journey from "./components/Journey";
import Profile from "./components/Profile";
import Footer from "./components/Footer";
import ContactForm from "./components/ContactForm";
import TechStack from "./components/TechStack";
import { useEffect } from "react";
import { REG_URL } from "./assets/strings";

function App() {
  useEffect(() => {
    fetch(REG_URL)
      .then(() => {
        // do nothing
        console.log("ok");
      })
      .catch(() => {
        //do nothing
      });
  }, []);

  return (
    <>
      <Header />
      <Hero />
      <Container
        sx={{
          display: "flex",
          flexDirection: "column",
          padding: "0 16px",
        }}
      >
        <Profile />
        <Journey />
        <TechStack />
        <ContactForm />
      </Container>
      <Footer />
    </>
  );
}

export default App;
