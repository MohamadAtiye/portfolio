export enum APP_NAMES {
  null = "null",
  todo = "todo",
  time = "time",
  recorder = "recorder",
  stopwatch = "stopwatch",
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
};
