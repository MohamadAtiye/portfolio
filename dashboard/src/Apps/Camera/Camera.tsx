import { Box, Select, MenuItem, Typography, Button } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import * as bodyPix from "@tensorflow-models/body-pix";
import "@tensorflow/tfjs";

const backgroundImage = new Image();
backgroundImage.src = "./beach.jpg";
backgroundImage.onload = (ev) => {
  console.log("loaded img", ev);
};
backgroundImage.onerror = (ev) => console.log("error", ev);
console.log(backgroundImage);

class PixWrapper {
  static net: bodyPix.BodyPix | null = null;
  static canvas = new OffscreenCanvas(640, 360);
  static context = PixWrapper.canvas.getContext("2d", {
    willReadFrequently: true,
  }) as OffscreenCanvasRenderingContext2D;

  // static canvas2 = new OffscreenCanvas(640, 360);
  // static context2 = PixWrapper.canvas2.getContext("2d", {
  //   willReadFrequently: true,
  // }) as OffscreenCanvasRenderingContext2D;

  static async load() {
    if (!PixWrapper.net) PixWrapper.net = await bodyPix.load();
  }

  static blurBackground = async (src: OffscreenCanvas) => {
    await PixWrapper.load();
    if (!PixWrapper.net) return src;

    PixWrapper.canvas.width = src.width;
    PixWrapper.canvas.height = src.height;

    const segmentation = await PixWrapper.net.segmentPerson(src);
    bodyPix.drawBokehEffect(
      PixWrapper.canvas,
      src,
      segmentation,
      10, // Blur amount
      7, // Edge blur amount
      false // Flip horizontal
    );

    return PixWrapper.canvas;
  };

  static changeBackground = async (
    src: OffscreenCanvas,
    background: HTMLImageElement
  ) => {
    await PixWrapper.load();
    if (!PixWrapper.net) return src;

    const segmentation = await PixWrapper.net.segmentPerson(src);

    const mask = bodyPix.toMask(segmentation);

    PixWrapper.canvas.width = src.width;
    PixWrapper.canvas.height = src.height;

    // mask the background
    PixWrapper.context.putImageData(mask, 0, 0);

    // draw background over masked
    PixWrapper.context.globalCompositeOperation = "source-in";
    PixWrapper.context.drawImage(background, 0, 0, src.width, src.height);
    PixWrapper.context.globalCompositeOperation = "source-over";

    return PixWrapper.canvas;
  };
}

enum BgMode {
  none = "none",
  blur = "blur",
  image = "image",
}
const bgModes = Object.values(BgMode);
const getNextBgMode = (currentMode: BgMode): BgMode => {
  const currentIndex = bgModes.indexOf(currentMode);
  const nextIndex = (currentIndex + 1) % bgModes.length;
  return bgModes[nextIndex];
};

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
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>("");
  const [selectedResolution, setSelectedResolution] =
    useState<string>("640x480");
  const [bgMode, setBgMode] = useState<BgMode>(BgMode.none);

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

  // handle video effects
  useEffect(() => {
    let trackProcessor: MediaStreamTrackProcessor<VideoFrame>;
    let trackGenerator: MediaStreamVideoTrackGenerator;
    if (stream.current) {
      if (bgMode === BgMode.none) {
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

          const final =
            bgMode === BgMode.blur
              ? await PixWrapper.blurBackground(canvas)
              : bgMode === BgMode.image
              ? await PixWrapper.changeBackground(canvas, backgroundImage)
              : canvas;
          // const blured = await PixWrapper.blurBackground(canvas);
          // const blured = await PixWrapper.changeBackground(
          //   canvas,
          //   backgroundImage
          // );
          context.drawImage(final, 0, 0);

          // Apply a blur filter
          // context.filter = "blur(10px)";
          // context.drawImage(canvas, 0, 0);

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
  }, [bgMode]);

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

        <Button onClick={() => setBgMode(getNextBgMode(bgMode))}>
          Background : {bgMode}
        </Button>
      </Box>
    </Box>
  );
}
