import { PlayerClass } from "./PlayerClass";
import { VisualiserClass } from "./VisualiserClass";

export enum RecorderStatus {
  idle = "idle",
  paused = "paused",
  recording = "recording",
  stopped = "stopped",
}

export function msToTime(duration: number) {
  const milliseconds = Math.floor(duration % 1000),
    seconds = Math.floor((duration / 1000) % 60),
    minutes =
      Math.floor((duration / (1000 * 60)) % 60) +
      Math.floor((duration / (1000 * 60 * 60)) * 60); // Convert hours to minutes and add to minutes

  const s_minutes = minutes < 10 ? "0" + minutes : minutes;
  const s_seconds = seconds < 10 ? "0" + seconds : seconds;
  const s_milliseconds =
    milliseconds < 10
      ? "00" + milliseconds
      : milliseconds < 100
      ? "0" + milliseconds
      : milliseconds;

  return s_minutes + ":" + s_seconds + ":" + s_milliseconds;
}

export class RecorderClass {
  private static recorderStatus = RecorderStatus.idle as RecorderStatus;

  private static audioChunks: Blob[] = [];
  private static stream = null as MediaStream | null;
  private static mediaRecorder = null as MediaRecorder | null;

  private static timerEl = null as HTMLSpanElement | null;

  static subscribeOnStatusChange(cb: (status: RecorderStatus) => void) {
    RecorderClass.statusCB = cb;
  }
  private static statusCB = (status: RecorderStatus) => {
    console.log({ status });
  };
  private static setStatus = (status: RecorderStatus) => {
    RecorderClass.recorderStatus = status;
    RecorderClass.triggerStatusCB();
  };
  private static triggerStatusCB() {
    RecorderClass.statusCB &&
      RecorderClass.statusCB(RecorderClass.recorderStatus);
  }

  private static handleEvents() {
    let lastTime = 0;
    let elapsed = 0;
    let countTimeLoop = 0;
    function countTime() {
      const now = Date.now();
      elapsed += now - lastTime;
      lastTime = now;

      if (RecorderClass.timerEl)
        RecorderClass.timerEl.innerText = msToTime(elapsed);

      countTimeLoop = requestAnimationFrame(countTime);
    }
    function startTime() {
      countTimeLoop = requestAnimationFrame(countTime);
    }
    function stopTime() {
      cancelAnimationFrame(countTimeLoop);
    }

    if (RecorderClass.mediaRecorder) {
      RecorderClass.mediaRecorder.ondataavailable = (event) => {
        RecorderClass.audioChunks = [...RecorderClass.audioChunks, event.data];
      };

      RecorderClass.mediaRecorder.onstart = () => {
        elapsed = 0;
        lastTime = Date.now();
        startTime();
      };

      RecorderClass.mediaRecorder.onresume = () => {
        lastTime = Date.now();
        startTime();
      };

      RecorderClass.mediaRecorder.onpause = () => {
        RecorderClass.setStatus(RecorderStatus.paused);
        stopTime();
      };

      RecorderClass.mediaRecorder.onstop = () => {
        PlayerClass.addRecording(RecorderClass.audioChunks, elapsed);

        //end stream
        RecorderClass.setStatus(RecorderStatus.stopped);

        stopTime();

        elapsed = 0;
        if (RecorderClass.timerEl)
          RecorderClass.timerEl.innerText = msToTime(elapsed);
        RecorderClass.cleanup();
      };
    }
  }

  private static cleanup() {
    RecorderClass.stream?.getTracks().forEach((t) => {
      t.stop();
      RecorderClass.stream?.removeTrack(t);
    });

    if (RecorderClass.mediaRecorder) {
      RecorderClass.mediaRecorder.ondataavailable = null;
      RecorderClass.mediaRecorder.onstart = null;
      RecorderClass.mediaRecorder.onresume = null;
      RecorderClass.mediaRecorder.onpause = null;
      RecorderClass.mediaRecorder.onstop = null;
      RecorderClass.mediaRecorder = null;
    }

    RecorderClass.audioChunks = [];
  }

  // exposed functions
  static setTimerEl(el: HTMLSpanElement) {
    RecorderClass.timerEl = el;
  }

  static async startRecording() {
    if (
      RecorderClass.mediaRecorder &&
      RecorderClass.recorderStatus === RecorderStatus.paused &&
      RecorderClass.stream
    ) {
      RecorderClass.mediaRecorder.resume();
      VisualiserClass.setupVisualizerForAudioElement(RecorderClass.stream);
      RecorderClass.setStatus(RecorderStatus.recording);
      return;
    }

    // start stream and recorder
    RecorderClass.audioChunks = [];
    RecorderClass.stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
    });
    RecorderClass.mediaRecorder = new MediaRecorder(RecorderClass.stream);
    RecorderClass.mediaRecorder.start();

    RecorderClass.setStatus(RecorderStatus.recording);

    VisualiserClass.setupVisualizerForAudioElement(RecorderClass.stream);

    RecorderClass.handleEvents();
  }

  static stopRecording = () => {
    if (RecorderClass.mediaRecorder) {
      RecorderClass.mediaRecorder.stop();
    }
    VisualiserClass.stopDraw();
  };

  static pauseRecording = () => {
    if (RecorderClass.mediaRecorder) {
      RecorderClass.mediaRecorder.pause();
    }
    VisualiserClass.stopDraw();
  };
}
