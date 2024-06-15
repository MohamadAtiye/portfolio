import { Box } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import IconButton from "@mui/material/IconButton";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import PauseIcon from "@mui/icons-material/Pause";
import StopIcon from "@mui/icons-material/Stop";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";

enum RecorderStatus {
  idle = "idle",
  paused = "paused",
  recording = "recording",
  stopped = "stopped",
}
class AudioRecorder {
  private static recorderStatus = RecorderStatus.idle as RecorderStatus;
  private static setStatus = (status: RecorderStatus) => {
    AudioRecorder.recorderStatus = status;
    AudioRecorder.onRecordingChange &&
      AudioRecorder.onRecordingChange(AudioRecorder.recorderStatus);
  };

  private static canvas = null as HTMLCanvasElement | null;
  private static canvasContext = null as CanvasRenderingContext2D | null;
  private static audioChunks: Blob[] = [];
  private static audioContext = null as AudioContext | null;
  private static analyser = null as AnalyserNode | null;
  private static dataArray = null as Uint8Array | null;
  private static stream = null as MediaStream | null;
  private static mediaRecorder = null as MediaRecorder | null;
  private static audioRecording = null as HTMLAudioElement | null;

  private static onRecordingChange = (v: RecorderStatus) => {
    console.log(v);
  };

  private static handleEvents() {
    if (
      AudioRecorder.recorderStatus === RecorderStatus.recording &&
      AudioRecorder.mediaRecorder
    ) {
      AudioRecorder.mediaRecorder.ondataavailable = (event) => {
        AudioRecorder.audioChunks = [...AudioRecorder.audioChunks, event.data];
      };
      AudioRecorder.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(AudioRecorder.audioChunks, {
          type: "audio/wav",
        });
        const audioUrl = URL.createObjectURL(audioBlob);
        AudioRecorder.audioRecording = new Audio(audioUrl);
      };

      AudioRecorder.draw();
    }
  }

  private static drawVisualizer = 0;
  private static draw = () => {
    if (
      AudioRecorder.analyser &&
      AudioRecorder.dataArray &&
      AudioRecorder.canvasContext &&
      AudioRecorder.canvas
    ) {
      const canvas = AudioRecorder.canvas;
      const canvasContext = AudioRecorder.canvasContext;

      AudioRecorder.analyser.getByteTimeDomainData(AudioRecorder.dataArray);
      canvasContext.fillStyle = "rgb(200, 200, 200)";
      canvasContext.fillRect(0, 0, canvas.width, canvas.height);

      canvasContext.lineWidth = 2;
      canvasContext.strokeStyle = "rgb(0, 0, 0)";
      canvasContext.beginPath();

      const sliceWidth = canvas.width / AudioRecorder.analyser.fftSize;
      let x = 0;

      for (let i = 0; i < AudioRecorder.analyser.fftSize; i++) {
        const v = AudioRecorder.dataArray[i] / 128.0;
        const y = (v * canvas.height) / 2;

        if (i === 0) {
          canvasContext.moveTo(x, y);
        } else {
          canvasContext.lineTo(x, y);
        }

        x += sliceWidth;
      }

      canvasContext.lineTo(canvas.width, canvas.height / 2);
      canvasContext.stroke();
    }
    AudioRecorder.drawVisualizer = requestAnimationFrame(AudioRecorder.draw);
  };

  // exposed functions
  static subscribeOnRecordingChange(cb: (v: RecorderStatus) => void) {
    AudioRecorder.onRecordingChange = cb;
  }

  static async startRecording() {
    if (
      AudioRecorder.mediaRecorder &&
      AudioRecorder.recorderStatus === RecorderStatus.paused
    ) {
      AudioRecorder.mediaRecorder.resume();
      AudioRecorder.setStatus(RecorderStatus.recording);
      AudioRecorder.draw();
      return;
    }
    AudioRecorder.audioChunks = [];
    AudioRecorder.stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
    });
    AudioRecorder.mediaRecorder = new MediaRecorder(AudioRecorder.stream);

    AudioRecorder.setStatus(RecorderStatus.recording);

    AudioRecorder.audioContext = new AudioContext();
    const source = AudioRecorder.audioContext.createMediaStreamSource(
      AudioRecorder.stream
    );
    AudioRecorder.analyser = AudioRecorder.audioContext.createAnalyser();

    AudioRecorder.analyser.fftSize = 2048;
    AudioRecorder.dataArray = new Uint8Array(AudioRecorder.analyser.fftSize);

    source.connect(AudioRecorder.analyser);

    AudioRecorder.mediaRecorder.start();

    AudioRecorder.handleEvents();
  }

  static stopRecording = () => {
    if (AudioRecorder.mediaRecorder) {
      AudioRecorder.mediaRecorder.stop();
      AudioRecorder.setStatus(RecorderStatus.stopped);
    }

    cancelAnimationFrame(AudioRecorder.drawVisualizer);
  };

  static pauseRecording = () => {
    if (AudioRecorder.mediaRecorder) {
      AudioRecorder.mediaRecorder.pause();
      AudioRecorder.setStatus(RecorderStatus.paused);
    }

    cancelAnimationFrame(AudioRecorder.drawVisualizer);
  };

  static setVisualiserCanvas(canvas: HTMLCanvasElement) {
    AudioRecorder.canvas = canvas;
    AudioRecorder.canvasContext = canvas.getContext("2d");
  }

  static playLastRecording() {
    AudioRecorder.audioRecording && AudioRecorder.audioRecording.play();
  }
}

interface ButtonProps {
  onClick: React.MouseEventHandler<HTMLButtonElement> | undefined;
  isDisabled?: boolean;
}
function RecordButton({ onClick, isDisabled }: ButtonProps) {
  return (
    <IconButton
      sx={{
        color: "red", // Set the color to red
        "&:hover": {
          bgcolor: "rgba(255, 0, 0, 0.1)", // Optional: change background on hover
        },
      }}
      aria-label="record"
      size="large" // Makes the button larger
      onClick={onClick}
      disabled={isDisabled}
    >
      <FiberManualRecordIcon sx={{ fontSize: "3rem" }} />
    </IconButton>
  );
}
function PauseButton({ onClick, isDisabled }: ButtonProps) {
  return (
    <IconButton
      sx={{
        color: "black", // Set the color to black or any color you prefer
        "&:hover": {
          bgcolor: "rgba(0, 0, 0, 0.1)", // Optional: change background on hover
        },
      }}
      aria-label="pause"
      size="large" // Makes the button larger
      onClick={onClick}
      disabled={isDisabled}
    >
      <PauseIcon sx={{ fontSize: "3rem" }} />
    </IconButton>
  );
}
function StopButton({ onClick, isDisabled }: ButtonProps) {
  return (
    <IconButton
      sx={{
        color: "red", // Set the color to red
        "&:hover": {
          bgcolor: "rgba(255, 0, 0, 0.1)", // Optional: change background on hover
        },
      }}
      aria-label="stop"
      size="large" // Makes the button larger
      onClick={onClick}
      disabled={isDisabled}
    >
      <StopIcon sx={{ fontSize: "3rem" }} />
    </IconButton>
  );
}
function PlayButton({ onClick, isDisabled }: ButtonProps) {
  return (
    <IconButton
      sx={{
        color: "black", // Set the color to black or any color you prefer
        "&:hover": {
          bgcolor: "rgba(0, 0, 0, 0.1)", // Optional: change background on hover
        },
      }}
      aria-label="play"
      size="large" // Makes the button larger
      onClick={onClick}
      disabled={isDisabled}
    >
      <PlayArrowIcon sx={{ fontSize: "3rem" }} />
    </IconButton>
  );
}

export default function Recorder() {
  const [recorderStatus, setRecorderStatus] = useState<RecorderStatus>(
    RecorderStatus.idle
  );
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const isRecording = recorderStatus === RecorderStatus.recording;

  useEffect(() => {
    if (canvasRef.current) AudioRecorder.setVisualiserCanvas(canvasRef.current);
    AudioRecorder.subscribeOnRecordingChange((v) => {
      console.log("Recording ", v);
      setRecorderStatus(v);
    });
  }, []);

  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        gap: 1,
      }}
    >
      <Box
        sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}
      >
        <PlayButton
          onClick={AudioRecorder.playLastRecording}
          isDisabled={recorderStatus !== RecorderStatus.stopped}
        />
        <StopButton
          onClick={AudioRecorder.stopRecording}
          isDisabled={
            recorderStatus !== RecorderStatus.recording &&
            recorderStatus !== RecorderStatus.paused
          }
        />
        {!isRecording ? (
          <RecordButton
            onClick={AudioRecorder.startRecording}
            isDisabled={isRecording}
          />
        ) : (
          <PauseButton
            onClick={AudioRecorder.pauseRecording}
            isDisabled={!isRecording}
          />
        )}
      </Box>

      <canvas ref={canvasRef} width="1000" height="300"></canvas>
    </Box>
  );
}
