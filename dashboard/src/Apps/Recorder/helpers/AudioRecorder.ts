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
  time: number;
};

export function msToTime(duration: number) {
  const milliseconds = Math.floor(duration % 1000),
    seconds = Math.floor((duration / 1000) % 60),
    minutes = Math.floor((duration / (1000 * 60)) % 60),
    hours = Math.floor((duration / (1000 * 60 * 60)) % 24);

  const s_hours = hours < 10 ? "0" + hours : hours;
  const s_minutes = minutes < 10 ? "0" + minutes : minutes;
  const s_seconds = seconds < 10 ? "0" + seconds : seconds;
  const s_milliseconds =
    milliseconds < 10
      ? "00" + milliseconds
      : milliseconds < 100
      ? "0" + milliseconds
      : milliseconds;

  return s_hours + ":" + s_minutes + ":" + s_seconds + ":" + s_milliseconds;
}

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

  private static timerEl = null as HTMLSpanElement | null;

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
    let lastTime = 0;
    let elapsed = 0;
    let countTimeLoop = 0;
    function countTime() {
      const now = Date.now();
      elapsed += now - lastTime;
      lastTime = now;

      if (AudioRecorder.timerEl)
        AudioRecorder.timerEl.innerText = msToTime(elapsed);

      countTimeLoop = requestAnimationFrame(countTime);
    }
    function startTime() {
      countTimeLoop = requestAnimationFrame(countTime);
    }
    function stopTime() {
      cancelAnimationFrame(countTimeLoop);
    }

    if (AudioRecorder.mediaRecorder) {
      AudioRecorder.mediaRecorder.ondataavailable = (event) => {
        AudioRecorder.audioChunks = [...AudioRecorder.audioChunks, event.data];
      };

      AudioRecorder.mediaRecorder.onstart = () => {
        elapsed = 0;
        lastTime = Date.now();
        startTime();
      };

      AudioRecorder.mediaRecorder.onresume = () => {
        lastTime = Date.now();
        startTime();
      };

      AudioRecorder.mediaRecorder.onpause = () => {
        AudioRecorder.setStatus(RecorderStatus.paused);
        stopTime();
      };

      AudioRecorder.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(AudioRecorder.audioChunks, {
          type: "audio/wav",
        });
        const audioUrl = URL.createObjectURL(audioBlob);
        AudioRecorder.audioRecordings.push({
          audio: new Audio(audioUrl),
          id: uuidv4(),
          time: elapsed,
        });

        //end stream
        AudioRecorder.setStatus(RecorderStatus.stopped);

        stopTime();
        AudioRecorder.cleanup();
      };
    }
  }

  private static cleanup() {
    AudioRecorder.stream?.getTracks().forEach((t) => {
      t.stop();
      AudioRecorder.stream?.removeTrack(t);
    });

    if (AudioRecorder.mediaRecorder) {
      AudioRecorder.mediaRecorder.ondataavailable = null;
      AudioRecorder.mediaRecorder.onstart = null;
      AudioRecorder.mediaRecorder.onresume = null;
      AudioRecorder.mediaRecorder.onpause = null;
      AudioRecorder.mediaRecorder.onstop = null;
      AudioRecorder.mediaRecorder = null;
    }
  }

  // exposed functions
  static setTimerEl(el: HTMLSpanElement) {
    AudioRecorder.timerEl = el;
  }
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
