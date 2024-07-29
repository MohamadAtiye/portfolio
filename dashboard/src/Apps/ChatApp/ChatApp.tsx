import { Box } from "@mui/material";
import { AuthProvider } from "./helpers/DataContext";
import ChatHead from "./components/ChatHead";
import ChatInputBox from "./components/ChatInputBox";
import ChatMessagesArea from "./components/ChatMessagesArea";

const ChatApp = () => {
  return (
    <AuthProvider>
      <Box
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          gap: 1,
        }}
      >
        TODO: change 2s interval to get messages to a long poll
        <ChatHead />
        <ChatMessagesArea />
        <ChatInputBox />
      </Box>
    </AuthProvider>
  );
};

export default ChatApp;
