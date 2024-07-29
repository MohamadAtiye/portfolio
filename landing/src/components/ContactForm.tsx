import React, { useState } from "react";
import {
  Box,
  Button,
  Paper,
  TextField,
  Typography,
  CircularProgress,
} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { CONTACT_URL } from "../assets/strings";

interface ContactFormValues {
  name: string;
  email: string;
  message: string;
}

const ContactForm: React.FC = () => {
  const [formValues, setFormValues] = useState<ContactFormValues>({
    name: "",
    email: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setFormValues({
      ...formValues,
      [name]: value,
    });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    // const response = await new Promise((resolve) =>
    //   setTimeout(() => {
    //     resolve({ ok: true });
    //   }, 1000)
    // );
    const response = await fetch(CONTACT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams(formValues as never).toString(),
    });

    setLoading(false);
    if (response.ok) {
      setSuccess(true);
      setFormValues({
        name: "",
        email: "",
        message: "",
      });
    } else {
      console.error("Form submission error");
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      id="anchor-Contact"
      paddingTop="70px"
    >
      <Typography variant="h4" align="center" gutterBottom>
        Contact Me
      </Typography>
      <Paper
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
          maxWidth: 500,
          margin: "0 auto",
          padding: 3,
          borderRadius: 1,
          position: "relative",
          height: "400px",
        }}
        elevation={3}
      >
        {success ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              textAlign: "center",
            }}
          >
            <CheckCircleOutlineIcon
              color="success"
              sx={{ fontSize: 50, mb: 2 }}
            />
            <Typography variant="h5">Message Sent</Typography>
          </Box>
        ) : (
          <>
            <Typography align="center">Get in touch</Typography>
            <TextField
              label="Name"
              name="name"
              value={formValues.name}
              onChange={handleChange}
              required
            />
            <TextField
              label="Email"
              name="email"
              type="email"
              value={formValues.email}
              onChange={handleChange}
              required
            />
            <TextField
              label="Message"
              name="message"
              value={formValues.message}
              onChange={handleChange}
              multiline
              rows={4}
              required
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : null}
            >
              {loading ? "Sending..." : "Send"}
            </Button>
          </>
        )}
      </Paper>
    </Box>
  );
};

export default ContactForm;
