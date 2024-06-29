import { Box, Select, MenuItem, Typography, Button } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import {
  BgMode,
  SegAlgo,
  VideoManip,
  getNextBgMode,
  getNextSegAlgo,
} from "./helpers/VideoManip";

const resolutions = [
  { label: "640x480 (VGA)", value: "640x480" },
  { label: "1280x720 (HD)", value: "1280x720" },
  { label: "1920x1080 (Full HD)", value: "1920x1080" },
  { label: "2560x1440 (QHD)", value: "2560x1440" },
  { label: "3840x2160 (4K)", value: "3840x2160" },
];

export default function Camera() {
  const stream = useRef<MediaStream | null>(null);
  // const secondStream = useRef<MediaStream | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>("");
  const [selectedResolution, setSelectedResolution] =
    useState<string>("640x480");

  const [manip, setManip] = useState({
    algo: SegAlgo.mp,
    mode: BgMode.none,
  });

  const [videoSettings, setVideoSettings] = useState<{
    width: number;
    height: number;
  }>({ width: 0, height: 0 });
  const [videoCapabilities, setVideoCapabilities] = useState<{
    width: number;
    height: number;
  }>({ width: 0, height: 0 });

  // handle device listing and selection
  useEffect(() => {
    const getDevices = async () => {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(
        (device) => device.kind === "videoinput"
      );
      setDevices(videoDevices);

      if (videoDevices.length > 0 && !selectedDeviceId) {
        setSelectedDeviceId(videoDevices[0].deviceId);
      }
    };
    getDevices();

    const handleDeviceChange = () => {
      getDevices();
    };

    navigator.mediaDevices.addEventListener("devicechange", handleDeviceChange);

    return () => {
      navigator.mediaDevices.removeEventListener(
        "devicechange",
        handleDeviceChange
      );
    };
  }, [selectedDeviceId]);

  // handle creating stream on device change
  useEffect(() => {
    if (selectedDeviceId && !stream.current) {
      const [width, height] = "640x480".split("x").map(Number);

      const VideoManipIsActive = VideoManip.isActive;
      if (VideoManipIsActive) VideoManip.stopVideoManip();

      navigator.mediaDevices
        .getUserMedia({
          video: {
            deviceId: selectedDeviceId,
            width: { exact: width },
            height: { exact: height },
          },
          audio: false,
        })
        .then((s) => {
          stream.current = s;

          const track = s.getVideoTracks()[0];
          const settings = track.getSettings();
          setVideoSettings({
            width: settings.width || width,
            height: settings.height || height,
          });

          const capabilities = track.getCapabilities();
          setVideoCapabilities({
            width: Number(capabilities.width?.max) || width,
            height: Number(capabilities.height?.max) || height,
          });

          setSelectedResolution("640x480");

          if (videoRef.current) {
            videoRef.current.srcObject = stream.current;
            if (VideoManipIsActive)
              VideoManip.startVideoManip(
                stream.current,
                videoRef.current,
                VideoManip.manip
              );
          }
        });

      return () => {
        if (stream.current) {
          stream.current.getTracks().forEach((t) => t.stop());
          stream.current = null;
        }
      };
    }
  }, [selectedDeviceId]);

  // handle resolution change
  useEffect(() => {
    if (stream.current) {
      const [width, height] = selectedResolution.split("x").map(Number);
      const track = stream.current.getVideoTracks()[0];
      track
        .applyConstraints({
          width: { ideal: width },
          height: { ideal: height },
        })
        .then(() => {
          const settings = track.getSettings();
          setVideoSettings({
            width: settings.width || width,
            height: settings.height || height,
          });

          const capabilities = track.getCapabilities();
          setVideoCapabilities({
            width: Number(capabilities.width?.max) || width,
            height: Number(capabilities.height?.max) || height,
          });
        });
    }
  }, [selectedResolution]);

  // handle video effects
  useEffect(() => {
    if (stream.current && videoRef.current) {
      if (manip.mode === BgMode.none) {
        if (videoRef.current) videoRef.current.srcObject = stream.current;
        return;
      }

      VideoManip.startVideoManip(stream.current, videoRef.current, manip);
    }

    return () => {
      if (VideoManip.isActive) VideoManip.stopVideoManip();
    };
  }, [manip]);

  const timeouter1 = useRef<NodeJS.Timeout>();
  const timeouter2 = useRef<NodeJS.Timeout>();

  const handleScreenshot = () => {
    clearTimeout(timeouter1.current);
    clearTimeout(timeouter2.current);
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      canvas.style.display = "none";
      canvas.style.transform = "none";
      canvas.style.transition = "none";

      const box = video.getBoundingClientRect();
      // console.log(box);

      const sr = box.width / box.height;

      const vw = video.videoWidth;
      const vh = video.videoHeight;
      const r = vw / vh;

      // console.log({ sr, r, vw, vh });

      const sh = sr > r ? box.height : box.width / r;
      const sw = sr > r ? box.height * r : box.width;
      canvas.style.height = `${sh}px`;
      canvas.style.width = `${sw}px`;

      canvas.style.left = `${sr > r ? (box.width - sw) / 2 : 0}px`;
      canvas.style.top = `${sr > r ? 0 : (box.height - sh) / 2}px`;

      if (ctx) {
        // Draw the video frame on the canvas
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        ctx.drawImage(video, 0, 0, vw, vh);

        // // Add the shutter effect
        canvas.style.border = "solid white";
        canvas.style.transition = "none";
        canvas.style.opacity = "1";
        canvas.style.display = "block";

        timeouter1.current = setTimeout(() => {
          console.log("timeouter1");
          canvas.style.transition = "all 1s ease-in-out";
          canvas.style.transform = "scale(0.2) translate(-80%, 80%)";
          canvas.style.opacity = "0";
        }, 100);

        timeouter2.current = setTimeout(() => {
          console.log("timeouter2");
          canvas.style.display = "none";
          canvas.style.transform = "none";
          canvas.style.transition = "none";
        }, 1000);
      }

      const offCanvas = new OffscreenCanvas(vw, vh);
      const offCtx = offCanvas.getContext("2d")!;
      offCtx.drawImage(video, 0, 0);

      // trigget download image
      const a = document.createElement("a");

      offCanvas
        .convertToBlob()
        .then((blob) => {
          const url = URL.createObjectURL(blob);
          a.href = url;
          a.download = "canvas-image.png";
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        })
        .catch((e) => console.error(e));
    }
  };

  // TODO : add capture video

  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        gap: 1,
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          overflow: "hidden",
          position: "relative",
        }}
      >
        <video
          ref={videoRef}
          autoPlay
          muted
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
          }}
        />
        <canvas
          ref={canvasRef}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100px",
            height: "100px",
            opacity: 0.5,
            display: "none",
            pointerEvents: "none",
          }}
        />
      </Box>

      {/* Video Settings */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          gap: 2,
          marginBottom: 1,
        }}
      >
        Settings
        <Typography variant="body2">
          Resolution: {videoSettings.width}x{videoSettings.height}
        </Typography>
      </Box>

      {/* Video Capabilities */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          gap: 2,
          marginBottom: 1,
        }}
      >
        Capabilities
        <Typography variant="body2">
          Resolution: {videoCapabilities.width}x{videoCapabilities.height}
        </Typography>
      </Box>

      {/* Controls Box */}
      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: 1,
        }}
      >
        <Select
          value={selectedDeviceId}
          onChange={(e) => setSelectedDeviceId(e.target.value as string)}
          size="small"
        >
          {devices.map((device) => (
            <MenuItem key={device.deviceId} value={device.deviceId}>
              {device.label || `Camera ${device.deviceId}`}
            </MenuItem>
          ))}
        </Select>

        <Select
          value={selectedResolution}
          onChange={(e) => setSelectedResolution(e.target.value as string)}
          size="small"
        >
          {resolutions.map((res) => (
            <MenuItem key={res.value} value={res.value}>
              {res.label}
            </MenuItem>
          ))}
        </Select>

        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            gap: 2,
            flexWrap: "wrap",
          }}
        >
          <Button
            variant="contained"
            size="small"
            onClick={() =>
              setManip((p) => ({ ...p, mode: getNextBgMode(manip.mode) }))
            }
          >
            Mode : {manip.mode}
          </Button>
          <Button
            variant="contained"
            size="small"
            onClick={() =>
              setManip((p) => ({ ...p, algo: getNextSegAlgo(manip.algo) }))
            }
          >
            Algo : {manip.algo}
          </Button>
          <Button variant="contained" size="small" onClick={handleScreenshot}>
            Capture
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
