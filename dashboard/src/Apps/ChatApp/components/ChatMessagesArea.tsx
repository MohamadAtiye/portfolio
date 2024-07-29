import { Box } from "@mui/material";
import { useData } from "../helpers/useData";
import ChatBubble from "./ChatBubble";

export default function ChatMessagesArea() {
  const { chatHistory } = useData();
  return (
    <Box
      sx={{
        flex: 1,
        border: "1px solid gray",
        borderRadius: "5px",
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
        padding: 1,
      }}
    >
      {/* AUTH LOGIC DONE!,
      <br />
      TODO: send/receive chat and long poll logic */}
      {chatHistory.map((c) => (
        <ChatBubble sms={c} key={c.id} />
      ))}
    </Box>
  );
}
