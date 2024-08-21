import {
  Box,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import { useCallback, useEffect, useRef, useState } from "react";
import AdvanceOptions from "./components/AdvanceOptions";
import CaptureButtonBox from "./components/CaptureButtonBox";
import {
  applyEffects,
  requestVideoStream,
  resolutions,
  updateStream,
} from "./helpers/WebRtc";
import DeviceSelect from "./components/DeviceSelect";

export default function Camera() {
  // source video stream
  const srcStream = useRef<MediaStream | null>(null); // original stream
  const srcVideoRef = useRef<HTMLVideoElement | null>(null); // video element
  const videoRef = useRef<HTMLVideoElement | null>(null); // video element
  const videoPipe = useRef<{
    processor: MediaStreamTrackProcessor<VideoFrame> | null;
    generator: MediaStreamVideoTrackGenerator | null;
    outStream: MediaStream | null;
  }>({
    processor: null,
    generator: null,
    outStream: null,
  }); // processed stream

  // cleanup effect
  useEffect(() => {
    return () => {
      if (srcStream.current) {
        try {
          srcStream.current.getTracks().forEach((t) => t.stop());
          srcStream.current = null;
        } catch (error) {
          console.error("error ending stream");
        }
      }
    };
  }, []);

  // stream options
  const [streamArgs, setStreamArgs] = useState({
    resolution: "800x480",
    deviceId: "",
    permission: "prompt",
    advanced: [] as {
      [x: string]: number | string;
    }[],
  });

  const [videoStats, setVideoStats] = useState({
    settings: {} as MediaTrackSettings,
    capabilities: {} as MediaTrackCapabilities,
  });

  ///////////////////////////////////////////////////////////////////////////////////// -- for Video Effects START
  const [videoEffects, setVideoEffects] = useState({
    flipped: false,
    blurred: false,
    edge: false,
  });
  const videoEffectsRef = useRef({
    flipped: false,
    blurred: false,
    edge: false,
  });
  useEffect(() => {
    videoEffectsRef.current = { ...videoEffects };
  }, [videoEffects]);

  // set stream to video element and calculate stats
  const setStream = useCallback(
    (stream: MediaStream, isTrackChanged = false) => {
      if (isTrackChanged) {
        srcStream.current = stream;

        // create media pipe
        const track = stream.getVideoTracks()[0];
        console.log({ track });
        // Create a Processor for reading the stream
        const processor = new MediaStreamTrackProcessor({ track: track });

        // Create a Generator for reassembling the stream
        const generator = new MediaStreamTrackGenerator({ kind: "video" });

        const os_canvas = new OffscreenCanvas(640, 360);
        const os_context = os_canvas.getContext("2d", {
          willReadFrequently: true,
        })!;
        const transformer = new TransformStream({
          async transform(
            videoFrame: VideoFrame,
            controller: TransformStreamDefaultController
          ) {
            applyEffects(
              os_canvas,
              os_context,
              videoFrame,
              videoEffectsRef.current.flipped,
              videoEffectsRef.current.edge,
              videoEffectsRef.current.blurred
            );

            // const w = videoFrame.displayWidth;
            // const h = videoFrame.displayHeight;
            // os_canvas.width = w;
            // os_canvas.height = h;

            // os_context.clearRect(0, 0, w, h);

            // if (videoEffectsRef.current.flipped) {
            //   // Flip the frame horizontally
            //   os_context.scale(-1, 1); // Scale horizontally by -1 (flips horizontally)
            //   os_context.translate(-w, 0); // Translate back to original position
            // }
            // os_context.drawImage(videoFrame, 0, 0);

            // Create a new video frame from the canvas
            const outFrame = new VideoFrame(os_canvas, {
              timestamp: videoFrame.timestamp,
            });

            // Enqueue the blurred frame
            controller.enqueue(outFrame);

            // Close the original frame to free up resources
            videoFrame.close();
          },
        });

        // Connect the Processor to the Generator
        processor.readable.pipeThrough(transformer).pipeTo(generator.writable);

        // create output stream
        videoPipe.current.outStream = new MediaStream([generator]);
      }

      if (
        videoRef.current &&
        srcVideoRef.current &&
        stream &&
        videoPipe.current.outStream
      ) {
        // get video stats
        const track = stream.getVideoTracks()[0];
        const settings = track.getSettings();
        const capabilities = track.getCapabilities();

        // set stream to video element
        videoRef.current.srcObject = videoPipe.current.outStream;
        srcVideoRef.current.srcObject = stream;

        console.log("setStream", { settings, capabilities });
        setVideoStats({
          settings: {
            ...settings,
          },
          capabilities: {
            ...capabilities,
          },
        });
      }
    },
    []
  );
  ///////////////////////////////////////////////////////////////////////////////////// -- for Video Effects END

  // called when streamArgs change
  useEffect(() => {
    console.log("useEffect", streamArgs);
    async function handleArgsChange() {
      // return on no permission
      if (streamArgs.permission !== "granted") return;

      // get needed constraints
      const [width, height] = streamArgs.resolution.split("x").map(Number);
      const constraints = {
        deviceId: streamArgs.deviceId,
        width: { exact: width },
        height: { exact: height },
        advanced: streamArgs.advanced,
      };

      /////////////////////////////// create new stream from scratch if not exist
      if (!srcStream.current) {
        // request new stream
        const newStream = await requestVideoStream(constraints);
        if (newStream) setStream(newStream, true);
        else throw new Error("failed to get new stream");

        return;
      }

      /////////////////////////////// else updating existing stream

      // Get the existing track's constraints
      const oldTracks = srcStream.current.getTracks();
      const oldConstraints = oldTracks[0].getConstraints();

      // get new stream if deviceId changed
      if (oldConstraints.deviceId !== constraints.deviceId) {
        const newStream = await requestVideoStream(constraints);
        if (!newStream) throw new Error("failed to get new stream");

        // cleanup old stream
        oldTracks.forEach((t) => t.stop());

        // update src stream
        setStream(newStream, true);
        return;
      }

      // else update existing stream
      // Apply new constraints to the existing track
      updateStream(srcStream.current, constraints).then(() => {
        srcStream.current && setStream(srcStream.current);
      });
    }
    handleArgsChange();
  }, [setStream, streamArgs]);

  const setAdvancedOptions = (advanced: MediaTrackSettings) => {
    const advancedConstraints = Object.entries(advanced).map((item) => ({
      [item[0]]: item[1],
    }));
    console.log("setAdvancedOptions", { advanced, advancedConstraints });

    setStreamArgs((p) => ({ ...p, advanced: advancedConstraints }));
  };

  ///////////////////////////////////////////////////////////////////////////////////// -- FOR SCREENSHOT
  const canvasRef = useRef<HTMLCanvasElement>(null); // screenshot effect canvas
  const timeOuter1 = useRef<NodeJS.Timeout>();
  const timeOuter2 = useRef<NodeJS.Timeout>();
  const handleScreenshot = () => {
    clearTimeout(timeOuter1.current);
    clearTimeout(timeOuter2.current);
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      canvas.style.display = "none";
      canvas.style.transform = "none";
      canvas.style.transition = "none";

      const box = video.getBoundingClientRect();

      const sr = box.width / box.height;

      const vw = video.videoWidth;
      const vh = video.videoHeight;
      const r = vw / vh;

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
        canvas.style.border = "4px solid white";
        canvas.style.transition = "none";
        canvas.style.opacity = "1";
        canvas.style.display = "block";

        timeOuter1.current = setTimeout(() => {
          canvas.style.transition = "all 1s ease-in-out";
          canvas.style.transform = "scale(0.2) translate(-80%, 80%)";
          canvas.style.opacity = "0";
        }, 100);

        timeOuter2.current = setTimeout(() => {
          canvas.style.display = "none";
          canvas.style.transform = "none";
          canvas.style.transition = "none";
        }, 1000);
      }

      const offCanvas = new OffscreenCanvas(vw, vh);
      const offCtx = offCanvas.getContext("2d")!;
      offCtx.drawImage(video, 0, 0);

      // trigger download image
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
      {/* VIDEO BOX */}
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
        <video
          ref={srcVideoRef}
          autoPlay
          muted
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100px",
            height: "100px",
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

      {/* STATS */}
      <table style={{ margin: "0 auto" }}>
        <tbody>
          <tr>
            <td>Permission</td>
            <td>{streamArgs.permission}</td>
          </tr>
          <tr>
            <td>Settings</td>
            <td>
              Resolution: {videoStats.settings.width}x
              {videoStats.settings.height}
            </td>
          </tr>
          <tr>
            <td>Capabilities</td>
            <td>
              Resolution: {videoStats.capabilities.width?.max}x
              {videoStats.capabilities.height?.max}
            </td>
          </tr>
        </tbody>
      </table>

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
        <Box sx={{ display: "flex", flexWrap: "wrap" }}>
          <DeviceSelect
            setStreamArgs={setStreamArgs}
            deviceId={streamArgs.deviceId}
          />
          <Select
            value={streamArgs.resolution}
            onChange={(e) => {
              setStreamArgs((p) => ({
                ...p,
                resolution: e.target.value as string,
              }));
            }}
            size="small"
            sx={{ flex: 1, minWidth: "350px" }}
          >
            {resolutions.map((res) => (
              <MenuItem key={res.value} value={res.value}>
                {res.label}
              </MenuItem>
            ))}
          </Select>
        </Box>

        {/* EFFECTS */}
        <Box>
          <FormControlLabel
            control={
              <Checkbox
                checked={videoEffects.flipped}
                onChange={(event) =>
                  setVideoEffects({
                    ...videoEffects,
                    flipped: event.target.checked,
                  })
                }
              />
            }
            label="Flip"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={videoEffects.blurred}
                onChange={(event) =>
                  setVideoEffects({
                    ...videoEffects,
                    blurred: event.target.checked,
                  })
                }
              />
            }
            label="Blur"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={videoEffects.edge}
                onChange={(event) =>
                  setVideoEffects({
                    ...videoEffects,
                    edge: event.target.checked,
                  })
                }
              />
            }
            label="Edge"
          />
        </Box>

        {/* ADVANCED SETTINGS */}
        <AdvanceOptions
          capabilities={videoStats.capabilities}
          settings={videoStats.settings}
          setAdvancedOptions={setAdvancedOptions}
        />
      </Box>

      {/* CAPTURE BUTTON */}
      <CaptureButtonBox handleScreenshot={handleScreenshot} />
    </Box>
  );
}
