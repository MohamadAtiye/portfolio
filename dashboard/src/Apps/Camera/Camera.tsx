import { Box, Select, MenuItem, Button } from "@mui/material";
import { useCallback, useEffect, useRef, useState } from "react";
import AdvanceOptions from "./components/AdvanceOptions";

const resolutions = [
  { label: "800x480 (VGA)", value: "800x480" },
  { label: "1280x720 (HD)", value: "1280x720" },
  { label: "1920x1080 (Full HD)", value: "1920x1080" },
  { label: "2560x1440 (QHD)", value: "2560x1440" },
  { label: "3840x2160 (4K)", value: "3840x2160" },
];

async function checkAndQueryCameraPermission(): Promise<
  "denied" | "granted" | "prompt" | "error"
> {
  try {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      return "error";
    }

    // query camera permission, return if granted or denied
    const permission = await navigator.permissions.query({
      name: "camera" as PermissionName,
    });
    if (permission.state === "granted" || permission.state === "denied")
      return permission.state;

    // continue if prompt and request video

    const requestedStream = await navigator.mediaDevices.getUserMedia({
      video: true,
    });
    if (requestedStream) {
      requestedStream.getTracks().forEach((track) => track.stop());
      return "granted";
    } else {
      return "denied";
    }
  } catch (error) {
    console.error("Error checking or requesting camera permission:", error);
    return "error";
  }
}

async function listVideoDevices(): Promise<MediaDeviceInfo[]> {
  try {
    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
      console.error("enumerateDevices is not supported in this browser.");
      return [];
    }

    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoDevices = devices.filter(
      (device) => device.kind === "videoinput"
    );
    return videoDevices;
  } catch (error) {
    console.error("Error listing video devices:", error);
    return [];
  }
}

async function requestVideoStream(constraints: MediaTrackConstraints) {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: constraints,
      audio: false,
    });
    return stream;
  } catch (error) {
    console.error("error starting stream", constraints, error);
    return null;
  }
}

async function updateStream(
  stream: MediaStream,
  constraints: MediaTrackConstraints,
  advanced?: {
    [x: string]: number | string;
  }[]
) {
  try {
    await stream.getVideoTracks()[0].applyConstraints({
      ...constraints,
      advanced,
    });
  } catch (error) {
    console.error("error updating stream", constraints, error);
  }
}

export default function Camera() {
  const srcStream = useRef<MediaStream | null>(null); // original stream
  // const stream = useRef<MediaStream | null>(null); // processed stream

  const videoRef = useRef<HTMLVideoElement | null>(null); // video element
  const canvasRef = useRef<HTMLCanvasElement>(null); // screenshot effect canvas

  const [deviceList, setDeviceList] = useState<MediaDeviceInfo[]>([]);
  const [streamOptions, setStreamOptions] = useState({
    resolution: "800x480",
    deviceId: "",
    permission: "prompt",
  });

  const [isShowAdvances, setIsShowAdvanced] = useState(false);

  const setAdvancedOptions = (advanced: MediaTrackSettings) => {
    console.log(advanced);

    const advancedConstraints = Object.entries(advanced).map((item) => ({
      [item[0]]: item[1],
    }));

    if (srcStream.current) {
      const [width, height] = streamOptions.resolution.split("x").map(Number);
      const constraints = {
        deviceId: streamOptions.deviceId,
        width: { exact: width },
        height: { exact: height },
      };
      // Apply new constraints to the existing track
      updateStream(srcStream.current, constraints, advancedConstraints).then(
        () => {
          srcStream.current && setStream(srcStream.current);
        }
      );
    }
  };

  const [videoStats, setStats] = useState({
    settings: {} as MediaTrackSettings,
    capabilities: {} as MediaTrackCapabilities,
  });

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

  // handle device listing and selection
  useEffect(() => {
    function updateListAndSelection() {
      // check permission
      checkAndQueryCameraPermission().then((permission) => {
        setStreamOptions((p) => ({ ...p, permission }));
        if (permission !== "granted") return;

        // get devices
        listVideoDevices().then((devices) => {
          setDeviceList(devices);
          // update selection if needed
          if (
            !streamOptions.deviceId ||
            !devices.find((d) => d.deviceId === streamOptions.deviceId)
          ) {
            setStreamOptions((p) => ({
              ...p,
              deviceId: devices[0]?.deviceId ?? "",
            }));
          }
        });
      });
    }
    updateListAndSelection();
    navigator.mediaDevices.addEventListener(
      "devicechange",
      updateListAndSelection
    );
    return () => {
      navigator.mediaDevices.removeEventListener(
        "devicechange",
        updateListAndSelection
      );
    };
  }, [streamOptions.deviceId]);

  // set stream to video element and calculate stats
  const setStream = useCallback((stream: MediaStream) => {
    srcStream.current = stream;
    if (videoRef.current && stream) {
      // set stream to video element
      videoRef.current.srcObject = stream;

      // get video stats
      const track = stream.getVideoTracks()[0];
      const settings = track.getSettings();
      const capabilities = track.getCapabilities();

      console.log({ settings, capabilities });
      setStats({
        settings: {
          ...settings,
        },
        capabilities: {
          ...capabilities,
        },
      });
    }
  }, []);

  // handle device id and resolution change
  useEffect(() => {
    if (streamOptions.permission !== "granted") return;

    const [width, height] = streamOptions.resolution.split("x").map(Number);

    const constraints = {
      deviceId: streamOptions.deviceId,
      width: { exact: width },
      height: { exact: height },
    };

    // Check if srcStream.current already exists
    if (srcStream.current) {
      // Get the existing track's constraints
      const oldConstraints = srcStream.current
        .getVideoTracks()[0]
        .getConstraints();

      // Compare old and new constraints
      const constraintsChanged =
        JSON.stringify(oldConstraints) !== JSON.stringify(constraints);
      if (!constraintsChanged) return; // nothing changed, why are we here?

      // get new stream if deviceId changed
      if (oldConstraints.deviceId !== constraints.deviceId) {
        // cleanup old stream
        srcStream.current.getTracks().forEach((t) => t.stop());

        // request new stream
        requestVideoStream(constraints).then((stream) => {
          stream && setStream(stream);
        });
      }
      // else update existing stream
      else {
        // Apply new constraints to the existing track
        updateStream(srcStream.current, constraints).then(() => {
          srcStream.current && setStream(srcStream.current);
        });
      }
    } else {
      // No existing stream, request a new one
      requestVideoStream(constraints).then((stream) => {
        stream && setStream(stream);
      });
    }
  }, [setStream, streamOptions]);

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

        timeouter1.current = setTimeout(() => {
          canvas.style.transition = "all 1s ease-in-out";
          canvas.style.transform = "scale(0.2) translate(-80%, 80%)";
          canvas.style.opacity = "0";
        }, 100);

        timeouter2.current = setTimeout(() => {
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
            <td>{streamOptions.permission}</td>
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
          <Select
            value={streamOptions.deviceId}
            onChange={(e) => {
              setStreamOptions((p) => ({
                ...p,
                deviceId: e.target.value as string,
              }));
            }}
            size="small"
            sx={{ flex: 1, minWidth: "350px" }}
          >
            {deviceList.map((device) => (
              <MenuItem key={device.deviceId} value={device.deviceId}>
                {device.label || `Camera ${device.deviceId}`}
              </MenuItem>
            ))}
          </Select>
          <Select
            value={streamOptions.resolution}
            onChange={(e) => {
              setStreamOptions((p) => ({
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

        <Button onClick={() => setIsShowAdvanced((p) => !p)}>
          {isShowAdvances ? "Hide" : "Show"} advanced settings
        </Button>
        {/* ADVANCED SETTINGS */}
        {isShowAdvances && (
          <AdvanceOptions
            capabilities={videoStats.capabilities}
            settings={videoStats.settings}
            setAdvancedOptions={setAdvancedOptions}
          />
        )}
      </Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          gap: 2,
          flexWrap: "wrap",
        }}
      >
        <Button variant="contained" size="small" onClick={handleScreenshot}>
          Capture
        </Button>
      </Box>
    </Box>
  );
}
