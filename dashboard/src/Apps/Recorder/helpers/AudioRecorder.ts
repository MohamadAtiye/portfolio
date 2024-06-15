import { AudioVisualiser } from "./AudioVisualiser";
import { v4 as uuidv4 } from "uuid";

export enum RecorderStatus {
  idle = "idle",
  paused = "paused",
  recording = "recording",
  stopped = "stopped",
}
export type MediaRecording = {
  audio: HTMLAudioElement;
  id: string;
};

export class AudioRecorder {
  private static recorderStatus = RecorderStatus.idle as RecorderStatus;
  private static setStatus = (status: RecorderStatus) => {
    AudioRecorder.recorderStatus = status;
    AudioRecorder.triggerStatusCB();
  };

  private static audioChunks: Blob[] = [];
  private static stream = null as MediaStream | null;
  private static mediaRecorder = null as MediaRecorder | null;

  private static audioRecordings = [] as MediaRecording[];

  private static statusCB = (
    status: RecorderStatus,
    recordings: MediaRecording[]
  ) => {
    console.log({ status, recordings });
  };

  private static triggerStatusCB() {
    AudioRecorder.statusCB &&
      AudioRecorder.statusCB(
        AudioRecorder.recorderStatus,
        AudioRecorder.audioRecordings
      );
  }

  private static handleEvents() {
    if (AudioRecorder.mediaRecorder) {
      AudioRecorder.mediaRecorder.ondataavailable = (event) => {
        AudioRecorder.audioChunks = [...AudioRecorder.audioChunks, event.data];
      };

      AudioRecorder.mediaRecorder.onpause = () => {
        AudioRecorder.setStatus(RecorderStatus.paused);
      };

      AudioRecorder.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(AudioRecorder.audioChunks, {
          type: "audio/wav",
        });
        const audioUrl = URL.createObjectURL(audioBlob);
        AudioRecorder.audioRecordings.push({
          audio: new Audio(audioUrl),
          id: uuidv4(),
        });

        //end stream
        AudioRecorder.stream?.getTracks().forEach((t) => {
          t.stop();
          AudioRecorder.stream?.removeTrack(t);
        });
        AudioRecorder.setStatus(RecorderStatus.stopped);
      };
    }
  }

  // exposed functions
  static subscribeOnStatusChange(
    cb: (status: RecorderStatus, recordings: MediaRecording[]) => void
  ) {
    AudioRecorder.statusCB = cb;
  }

  static async startRecording() {
    if (
      AudioRecorder.mediaRecorder &&
      AudioRecorder.recorderStatus === RecorderStatus.paused &&
      AudioRecorder.stream
    ) {
      AudioRecorder.mediaRecorder.resume();
      AudioVisualiser.setupVisualizerForAudioElement(AudioRecorder.stream);
      AudioRecorder.setStatus(RecorderStatus.recording);
      return;
    }

    // start stream and recorder
    AudioRecorder.audioChunks = [];
    AudioRecorder.stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
    });
    AudioRecorder.mediaRecorder = new MediaRecorder(AudioRecorder.stream);
    AudioRecorder.mediaRecorder.start();

    AudioRecorder.setStatus(RecorderStatus.recording);

    AudioVisualiser.setupVisualizerForAudioElement(AudioRecorder.stream);

    AudioRecorder.handleEvents();
  }

  static stopRecording = () => {
    if (AudioRecorder.mediaRecorder) {
      AudioRecorder.mediaRecorder.stop();
    }
    AudioVisualiser.stopDraw();
  };

  static pauseRecording = () => {
    if (AudioRecorder.mediaRecorder) {
      AudioRecorder.mediaRecorder.pause();
    }
    AudioVisualiser.stopDraw();
  };

  static playLastRecording() {
    if (AudioRecorder.audioRecordings.length > 0) {
      AudioVisualiser.setupVisualizerForAudioElement(
        AudioRecorder.audioRecordings[AudioRecorder.audioRecordings.length - 1]
          .audio
      );
      AudioRecorder.audioRecordings[
        AudioRecorder.audioRecordings.length - 1
      ].audio.play();
    }
  }
}
