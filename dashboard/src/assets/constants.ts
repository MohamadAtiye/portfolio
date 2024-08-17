export enum APP_NAMES {
  null = "null",
  todo = "todo",
  time = "time",
  recorder = "recorder",
  stopwatch = "stopwatch",
  camera = "camera",
  whiteboard = "whiteboard",
  calculator = "calculator",
  chat = "chat",
  imageTools = "imageTools",
}

export const APPS: Record<APP_NAMES, { text: string }> = {
  null: {
    text: "Close",
  },
  todo: {
    text: "ToDo",
  },
  time: {
    text: "Time",
  },
  recorder: {
    text: "Recorder",
  },
  stopwatch: {
    text: "Stopwatch",
  },
  camera: {
    text: "Camera",
  },
  whiteboard: {
    text: "Whiteboard",
  },
  calculator: {
    text: "Calculator",
  },
  chat: {
    text: "Chat",
  },
  imageTools: {
    text: "Image Tools",
  },
};
