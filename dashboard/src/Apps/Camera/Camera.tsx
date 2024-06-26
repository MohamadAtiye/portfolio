import { Box, Select, MenuItem, Typography, Button } from "@mui/material";
import { useEffect, useRef, useState } from "react";

export default function Camera() {
  const stream = useRef<MediaStream | null>(null);
  // const secondStream = useRef<MediaStream | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>("");
  const [selectedResolution, setSelectedResolution] =
    useState<string>("640x480");
  const [isBlur, setIsBlur] = useState(false);

  const [videoSettings, setVideoSettings] = useState<{
    width: number;
    height: number;
  }>({ width: 0, height: 0 });
  const [videoCapabilities, setVideoCapabilities] = useState<{
    width: number;
    height: number;
  }>({ width: 0, height: 0 });

  const resolutions = [
    { label: "640x480 (VGA)", value: "640x480" },
    { label: "1280x720 (HD)", value: "1280x720" },
    { label: "1920x1080 (Full HD)", value: "1920x1080" },
    { label: "2560x1440 (QHD)", value: "2560x1440" },
    { label: "3840x2160 (4K)", value: "3840x2160" },
  ];

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

  useEffect(() => {
    let trackProcessor: MediaStreamTrackProcessor<VideoFrame>;
    let trackGenerator: MediaStreamVideoTrackGenerator;
    if (stream.current) {
      if (!isBlur) {
        if (videoRef.current) videoRef.current.srcObject = stream.current;
        return;
      }

      const videoTrack = stream.current.getVideoTracks()[0];

      // create proccessor object that will handle frame changes
      const trackProcessor = new MediaStreamTrackProcessor({
        track: videoTrack,
      });
      // create generator which composes frames back into a stream
      const trackGenerator = new MediaStreamTrackGenerator({ kind: "video" });

      const canvas = new OffscreenCanvas(640, 360);
      const context = canvas.getContext("2d", { willReadFrequently: true })!;

      const transformer = new TransformStream({
        async transform(
          videoFrame: VideoFrame,
          controller: TransformStreamDefaultController
        ) {
          canvas.width = videoFrame.displayWidth;
          canvas.height = videoFrame.displayHeight;

          // Draw the frame onto the canvas
          context.drawImage(videoFrame, 0, 0);

          // Apply a blur filter
          context.filter = "blur(10px)";
          context.drawImage(canvas, 0, 0);

          // Create a new video frame from the canvas
          const blurredFrame = new VideoFrame(canvas, {
            timestamp: videoFrame.timestamp,
          });

          // Enqueue the blurred frame
          controller.enqueue(blurredFrame);

          // Close the original frame to free up resources
          videoFrame.close();
        },
      });

      trackProcessor.readable
        .pipeThrough(transformer)
        .pipeTo(trackGenerator.writable);

      const streamAfter = new MediaStream([trackGenerator]);

      if (videoRef.current) {
        videoRef.current.srcObject = streamAfter;
      }
    }

    return () => {
      try {
        // Close the generator
        if (trackGenerator) trackGenerator.stop();

        // Close the processor readable and generator writable streams
        if (trackProcessor) trackProcessor.readable.cancel();
        if (trackGenerator) trackGenerator.writable.abort();
      } catch (e) {
        console.error(e);
      }
    };
  }, [isBlur]);

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
        }}
      >
        <video
          ref={videoRef}
          autoPlay
          muted
          style={{
            backgroundColor: "black",
            width: "100%",
            height: "100%",
            objectFit: "contain",
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
        >
          {resolutions.map((res) => (
            <MenuItem key={res.value} value={res.value}>
              {res.label}
            </MenuItem>
          ))}
        </Select>

        <Button onClick={() => setIsBlur((p) => !p)}>
          {isBlur ? "unblur" : "blur"}
        </Button>
      </Box>
    </Box>
  );
}
