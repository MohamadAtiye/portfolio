import { Box, Button, TextField } from "@mui/material";
import React, { useState } from "react";

export default function ChatInputBox() {
  const [inputText, setInputText] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // call send message API

    setInputText("");
  };
  return (
    <Box component={"form"} onSubmit={handleSubmit} sx={{ display: "flex" }}>
      <TextField
        sx={{ flex: 1, fontSize: "16px" }}
        placeholder="Enter a Message"
        name="textInput"
        required
        value={inputText}
        onChange={(e) => {
          setInputText(e.target.value);
        }}
        autoComplete="off"
      />
      <Button type="submit" variant="contained">
        Send
      </Button>
    </Box>
  );
}
