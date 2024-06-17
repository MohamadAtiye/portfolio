import { v4 as uuidv4 } from "uuid";
import { VisualiserClass } from "./VisualiserClass";

export type MediaRecording = {
  audio: HTMLAudioElement;
  id: string;
  time: number;
  name: string;
  audioUrl: string;
};

export enum PlayerStatus {
  idle = "idle",
  ready = "ready",
  playing = "playing",
  paused = "paused",
}

export class PlayerClass {
  private static playerStatus = PlayerStatus.idle;
  private static statusCB = (
    status: PlayerStatus,
    recordingsList: MediaRecording[]
  ) => {
    console.log(status, recordingsList);
  };
  static subscribeOnStatusChange(
    cb: (status: PlayerStatus, recordingsList: MediaRecording[]) => void
  ) {
    PlayerClass.statusCB = cb;
  }
  private static setStatus = (status: PlayerStatus) => {
    PlayerClass.playerStatus = status;
    PlayerClass.triggerStatusCB();
  };
  private static triggerStatusCB() {
    PlayerClass.statusCB &&
      PlayerClass.statusCB(
        PlayerClass.playerStatus,
        PlayerClass.audioRecordings
      );
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
  };

  static selectRecording = (id: string) => {
    const recording = PlayerClass.audioRecordings.find((r) => r.id === id);
    if (!recording) return;
    PlayerClass.selectedRecording = recording;

    PlayerClass.setStatus(PlayerStatus.ready);
  };

  static playRecording = () => {
    if (!PlayerClass.selectedRecording) return;

    VisualiserClass.setupVisualizerForAudioElement(
      PlayerClass.selectedRecording.audio
    );
    PlayerClass.selectedRecording.audio.play();
    PlayerClass.setStatus(PlayerStatus.playing);
  };

  static pauseRecording = () => {
    if (!PlayerClass.selectedRecording) return;
    PlayerClass.selectedRecording.audio.pause();
    PlayerClass.setStatus(PlayerStatus.paused);
  };
}
