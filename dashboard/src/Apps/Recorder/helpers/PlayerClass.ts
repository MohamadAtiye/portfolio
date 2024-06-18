import { v4 as uuidv4 } from "uuid";
import { msToTime } from "./RecorderClass";

export type MediaRecording = {
  audio: HTMLAudioElement;
  id: string;
  time: number;
  name: string;
  audioUrl: string;
};

export class PlayerClass {
  private static statusCB = (recordingsList: MediaRecording[]) => {
    console.log(recordingsList);
  };
  static subscribeOnStatusChange(
    cb: (recordingsList: MediaRecording[]) => void
  ) {
    PlayerClass.statusCB = cb;
  }
  private static triggerStatusCB() {
    PlayerClass.statusCB && PlayerClass.statusCB(PlayerClass.audioRecordings);
  }

  private static trackNameRef = null as HTMLSpanElement | null;
  private static timerRef = null as HTMLSpanElement | null;
  private static playerDivRef = null as HTMLDivElement | null;
  static setHtmlElements(
    trackNameRef: HTMLSpanElement,
    timerRef: HTMLSpanElement,
    playerDivRef: HTMLDivElement
  ) {
    PlayerClass.trackNameRef = trackNameRef;
    PlayerClass.timerRef = timerRef;
    PlayerClass.playerDivRef = playerDivRef;
  }

  private static audioRecordings = [] as MediaRecording[];
  private static selectedRecording = null as MediaRecording | null;

  static addRecording = (audioChunks: Blob[], elapsed: number) => {
    const audioBlob = new Blob(audioChunks, {
      type: "audio/wav",
    });
    const audioUrl = URL.createObjectURL(audioBlob);
    const newId = uuidv4();
    PlayerClass.audioRecordings.push({
      audio: new Audio(audioUrl),
      id: newId,
      time: elapsed,
      name: `rec${PlayerClass.audioRecordings.length}`,
      audioUrl,
    });

    PlayerClass.selectRecording(newId);
    PlayerClass.triggerStatusCB();
  };

  static selectRecording = (id: string) => {
    const recording = PlayerClass.audioRecordings.find((r) => r.id === id);
    if (!recording) return;

    PlayerClass.selectedRecording = recording;

    if (PlayerClass.trackNameRef)
      PlayerClass.trackNameRef.innerText = recording.name;

    if (PlayerClass.timerRef)
      PlayerClass.timerRef.innerText = msToTime(recording.time);

    if (PlayerClass.playerDivRef) {
      recording.audio.controls = true;
      PlayerClass.playerDivRef.innerHTML = "";
      PlayerClass.playerDivRef.appendChild(recording.audio);
    }
  };
}
