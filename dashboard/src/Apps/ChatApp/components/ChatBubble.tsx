// src/components/ChatBubble.tsx

import React, { useEffect, useState } from "react";
import { Paper, Typography } from "@mui/material";
import { SMS } from "../helpers/DataContext";
import { useData } from "../helpers/useData";

function formatTimestamp(unixTS: number): string {
  const now = Math.floor(Date.now() / 1000); // Convert to seconds

  const elapsedSeconds = now - unixTS;
  if (elapsedSeconds < 60) {
    return `${elapsedSeconds} seconds ago`;
  } else if (elapsedSeconds < 60 * 30) {
    const minutes = Math.floor(elapsedSeconds / 60);
    return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  } else {
    const date = new Date(unixTS * 1000); // Convert back to milliseconds
    const formattedDate = date.toLocaleString("en-US", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    // Extract day, month, and year
    const [month, day, year] = formattedDate.split("/");
    return `${day}/${month}/${year}`;
  }
}

interface ChatBubbleProps {
  sms: SMS;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({ sms }) => {
  const { userID } = useData();

  const [smsTime, setSmsTime] = useState("");
  useEffect(() => {
    const i = setInterval(() => {
      setSmsTime(formatTimestamp(sms.sendTS));
    }, 5000);
    setSmsTime(formatTimestamp(sms.sendTS));
    return () => {
      clearInterval(i);
    };
  }, [sms.sendTS]);

  const isFromMe = userID === sms.from_user;

  const bubbleStyle = {
    backgroundColor: isFromMe ? "#DCF8C6" : "#E0E0E0",
    padding: "10px",
    borderRadius: "10px",
    alignSelf: isFromMe ? "flex-end" : "flex-start",
    maxWidth: "70%",
    marginBottom: "10px",
  };

  return (
    <Paper elevation={3} style={bubbleStyle}>
      <Typography variant="caption">
        {sms.from_user_name}
        {isFromMe && " (me)"}
      </Typography>
      <Typography variant="body1" sx={{ wordBreak: "break-word" }}>
        {sms.content}
      </Typography>
      <Typography variant="caption" color="textSecondary">
        {/* {formattedDate} */}
        {smsTime}
      </Typography>
    </Paper>
  );
};

export default ChatBubble;
