import { Box, Button, TextField, Typography } from "@mui/material";
import React, { useState } from "react";
import { useData } from "../helpers/useData";
import { MAX_SMS_LENGTH } from "../helpers/DataContext";

export default function ChatInputBox() {
  const { sendSms } = useData();
  const [inputText, setInputText] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // call send message API
    sendSms(inputText);
    setInputText("");
  };
  return (
    <Box component={"form"} onSubmit={handleSubmit} sx={{ display: "flex" }}>
      <Box sx={{ position: "relative", flex: 1 }}>
        <TextField
          fullWidth
          sx={{ fontSize: "16px" }}
          placeholder="Enter a Message"
          name="textInput"
          required
          value={inputText}
          onChange={(e) => {
            setInputText(e.target.value);
          }}
          autoComplete="off"
          inputProps={{ maxLength: MAX_SMS_LENGTH }}
          multiline
          maxRows={3} // Maximum number of rows (adjust as needed)
        />
        <Typography
          variant="caption"
          sx={{
            position: "absolute",
            bottom: 0,
            right: "10px",
            color: "gray", // Customize the color as needed
          }}
        >
          {inputText.length}/{MAX_SMS_LENGTH}
        </Typography>
      </Box>
      <Button type="submit" variant="contained">
        Send
      </Button>
    </Box>
  );
}
