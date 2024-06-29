import { Box, Select, MenuItem, Typography, Button } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import * as bodyPix from "@tensorflow-models/body-pix";
import "@tensorflow/tfjs";
import { Results, SelfieSegmentation } from "@mediapipe/selfie_segmentation";

enum BgMode {
  none = "none",
  blur = "blur",
  mirror = "mirror",
  image = "image",
}
enum SegAlgo {
  pix = "pix", // bodyPix
  mp = "mp", // mediapipe
}

const bgModes = Object.values(BgMode);
const segAlgos = Object.values(SegAlgo);
const getNextBgMode = (currentMode: BgMode): BgMode => {
  const currentIndex = bgModes.indexOf(currentMode);
  const nextIndex = (currentIndex + 1) % bgModes.length;
  return bgModes[nextIndex];
};
const getNextSegAlgo = (currentMode: SegAlgo): SegAlgo => {
  const currentIndex = segAlgos.indexOf(currentMode);
  const nextIndex = (currentIndex + 1) % segAlgos.length;
  return segAlgos[nextIndex];
};

// load background image
const backgroundImage = new Image();
backgroundImage.src = "./beach.jpg";
backgroundImage.onload = (ev) => {
  console.log("loaded img", ev);
};
backgroundImage.onerror = (ev) => console.log("error", ev);

// initialize bodyPix selfie segmentation
let net: bodyPix.BodyPix;
const loadBodyPix = async () => {
  try {
    const n = await bodyPix.load();
    net = n;
  } catch (e) {
    console.error(e);
  }
};
loadBodyPix();

// initialize media pipe selfie segmentationm
const selfieSegmentation = new SelfieSegmentation({
  locateFile: (file: string) =>
    `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/${file}`,
});
selfieSegmentation.setOptions({
  modelSelection: 1,
  selfieMode: true,
});

class VideoManip {
  static manip = {
    algo: SegAlgo.pix,
    mode: BgMode.none,
  };

  static trackProcessor: MediaStreamTrackProcessor<VideoFrame> | null;
  static trackGenerator: MediaStreamVideoTrackGenerator | null;
  static videoEl: HTMLVideoElement;
  static streamAfter: MediaStream;

  static canvas = new OffscreenCanvas(640, 360);
  static context = VideoManip.canvas.getContext("2d", {
    willReadFrequently: true,
  })!;

  static seg_mask_result: Results;

  // -- generic START - END
  static startVideoManip = (
    stream: MediaStream,
    videoEl: HTMLVideoElement,
    manip: {
      algo: SegAlgo;
      mode: BgMode;
    }
  ) => {
    VideoManip.manip = manip;
    const track = stream.getVideoTracks()[0];
    VideoManip.videoEl = videoEl;

    const os_canvas = new OffscreenCanvas(640, 360);
    const os_context = os_canvas.getContext("2d", {
      willReadFrequently: true,
    })!;

    const mask_canvas = new OffscreenCanvas(640, 360);
    const mask_context = mask_canvas.getContext("2d", {
      willReadFrequently: true,
    })!;

    const bg_canvas = new OffscreenCanvas(640, 360);
    const bg_context = bg_canvas.getContext("2d", {
      willReadFrequently: true,
    })!;

    selfieSegmentation.onResults(VideoManip.onResults);

    const rand = Math.random();
    let skipper = 0;
    const transformer = new TransformStream({
      async transform(
        videoFrame: VideoFrame,
        controller: TransformStreamDefaultController
      ) {
        if (skipper > 30) {
          console.log(rand);
          skipper = 0;
        }
        skipper++;

        const manip = VideoManip.manip;

        const w = videoFrame.displayWidth;
        const h = videoFrame.displayHeight;

        os_canvas.width = w;
        os_canvas.height = h;
        os_context.clearRect(0, 0, w, h);

        console.time(`${rand}`);

        // get segmentation mask to mask_canvas
        // TODO: downscale
        mask_canvas.height = h;
        mask_canvas.width = w;
        mask_context.clearRect(0, 0, w, h);
        if (manip.algo === SegAlgo.mp) {
          await VideoManip.sendFrame(videoFrame);
          if (VideoManip.seg_mask_result) {
            mask_context.save();
            mask_context.scale(-1, 1);
            mask_context.drawImage(
              VideoManip.seg_mask_result.segmentationMask,
              0,
              0,
              -w,
              h
            );
            mask_context.globalCompositeOperation = "source-in";
            mask_context.drawImage(
              VideoManip.seg_mask_result.image,
              -w,
              0,
              w,
              h
            );
            mask_context.restore();
          }
          // console.log("draw");
        } else if (manip.algo === SegAlgo.pix) {
          os_context.drawImage(videoFrame, 0, 0, w, h);
          const segmentation = await net.segmentPerson(os_canvas);
          const mask = bodyPix.toMask(segmentation);
          mask_context.putImageData(mask, 0, 0);
        }

        // // draw full blur frame or BG
        bg_canvas.width = w;
        bg_canvas.height = h;
        bg_context.clearRect(0, 0, w, h);
        if (manip.mode === BgMode.blur) {
          bg_context.save();
          bg_context.filter = "blur(10px)";

          // bg_context.scale(-1, 1);
          bg_context.drawImage(videoFrame, 0, 0, w, h);

          bg_context.restore();
          bg_context.filter = "none";
        } else if (manip.mode === BgMode.mirror) {
          // TODO: expand on this
          bg_context.save();
          bg_context.scale(-1, 1);
          bg_context.drawImage(videoFrame, 0, 0, -w, h);
          bg_context.restore();
        } else if (manip.mode === BgMode.image) {
          bg_context.drawImage(backgroundImage, 0, 0, w, h);
        }

        os_context.drawImage(bg_canvas, 0, 0);
        os_context.drawImage(mask_canvas, 0, 0);

        os_context.restore();
        console.timeEnd(`${rand}`);

        // Create a new video frame from the canvas
        const blurredFrame = new VideoFrame(os_canvas, {
          timestamp: videoFrame.timestamp,
        });

        // Enqueue the blurred frame
        controller.enqueue(blurredFrame);

        // Close the original frame to free up resources
        videoFrame.close();
      },
    });

    // create proccessor object that will handle frame changes
    VideoManip.trackProcessor = new MediaStreamTrackProcessor({
      track: track,
    });
    // create generator which composes frames back into a stream
    VideoManip.trackGenerator = new MediaStreamTrackGenerator({
      kind: "video",
    });

    VideoManip.trackProcessor.readable
      .pipeThrough(transformer)
      .pipeTo(VideoManip.trackGenerator.writable);

    // create the output stream
    VideoManip.streamAfter = new MediaStream([VideoManip.trackGenerator]);
    VideoManip.videoEl.srcObject = VideoManip.streamAfter;
  };

  static stopVideoManip = async () => {
    try {
      if (VideoManip.trackGenerator) {
        VideoManip.trackGenerator.stop();
        VideoManip.streamAfter.getTracks().forEach((t) => {
          VideoManip.streamAfter.removeTrack(t);
          t.stop();
        });
        // const r = VideoManip.trackGenerator.writable.getWriter();
        // r.releaseLock();
      }
      // if (VideoManip.r) {
      //   VideoManip.r.releaseLock();
      //   await VideoManip.r.abort();
      //   await VideoManip.r.close();
      // }

      // // Abort the writable stream of the track generator
      // if (VideoManip.trackGenerator && VideoManip.wr) {
      //   await VideoManip.wr.close(); //.abort();
      //   await VideoManip.wr.abort();
      // }

      // // Cancel the readable stream of the track processor
      // if (VideoManip.trackProcessor && VideoManip.trackProcessor.readable) {
      //   await VideoManip.re.cancel();
      // }

      // // Abort the writable stream of the track generator
      // if (VideoManip.trackGenerator && VideoManip.trackGenerator.writable) {
      //   await VideoManip.trackGenerator.writable.abort();
      // }

      // Clear the references (optional but good for garbage collection)
      VideoManip.trackProcessor = null;
      VideoManip.trackGenerator = null;
    } catch (e) {
      console.error(e);
    }
  };

  // -- processor logic

  // bodyPix.BodyPix
  static blurBackground = async (src: OffscreenCanvas) => {
    if (!net) return src;

    VideoManip.canvas.width = src.width;
    VideoManip.canvas.height = src.height;

    const segmentation = await net.segmentPerson(src);
    bodyPix.drawBokehEffect(
      VideoManip.canvas,
      src,
      segmentation,
      10, // Blur amount
      7, // Edge blur amount
      false // Flip horizontal
    );

    return VideoManip.canvas;
  };

  static changeBackground = async (
    src: OffscreenCanvas,
    background: HTMLImageElement
  ) => {
    const segmentation = await net.segmentPerson(src);
    const mask = bodyPix.toMask(segmentation);

    VideoManip.canvas.width = src.width;
    VideoManip.canvas.height = src.height;

    // mask the background
    VideoManip.context.putImageData(mask, 0, 0);

    // draw background over masked
    VideoManip.context.globalCompositeOperation = "source-in";
    VideoManip.context.drawImage(background, 0, 0, src.width, src.height);
    VideoManip.context.globalCompositeOperation = "source-over";

    return VideoManip.canvas;
  };

  //////////////////////// media pipe
  static resCB = (c: OffscreenCanvas) => console.log(c);
  static setFrameCB = async (resCB: (c: OffscreenCanvas) => void) => {
    selfieSegmentation.onResults(VideoManip.onResults);
    VideoManip.resCB = resCB;
  };

  static temp_canvas = document.createElement("canvas"); // HTMLCanvasElement();
  static temp_context = VideoManip.temp_canvas.getContext("2d", {
    willReadFrequently: true,
  }) as CanvasRenderingContext2D;
  static sendFrame = async (videoFrame: VideoFrame) => {
    VideoManip.temp_canvas.width = videoFrame.displayWidth;
    VideoManip.temp_canvas.height = videoFrame.displayHeight;

    // Draw the frame onto the canvas
    VideoManip.temp_context.drawImage(videoFrame, 0, 0);
    await selfieSegmentation.send({ image: VideoManip.temp_canvas });
  };

  static onResults = (results: Results) => {
    VideoManip.seg_mask_result = results;
    // const context = VideoManip.mask_context;
    // const canvas = VideoManip.mask_canvas;

    // // context.save();
    // context.clearRect(0, 0, canvas.width, canvas.height);
    // context.drawImage(
    //   results.segmentationMask,
    //   0,
    //   0,
    //   canvas.width,
    //   canvas.height
    // );
    //now we have blackBG with mask in red

    // // Only overwrite existing pixels.
    // context.globalCompositeOperation = "source-out";
    // context.fillStyle = "#00FF00";
    // context.fillRect(0, 0, canvas.width, canvas.height);

    // // Only overwrite missing pixels.
    // context.globalCompositeOperation = "destination-atop";
    // context.drawImage(results.image, 0, 0, canvas.width, canvas.height);

    // context.globalCompositeOperation = "destination-in";
    // context.drawImage(results.image, 0, 0, canvas.width, canvas.height);

    // context.restore();

    // VideoManip.resCB(canvas);
  };
}

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
    if (stream.current && videoRef.current) {
      if (manip.mode === BgMode.none) {
        if (videoRef.current) videoRef.current.srcObject = stream.current;
        return;
      }

      VideoManip.startVideoManip(stream.current, videoRef.current, manip);
    }

    return () => {
      VideoManip.stopVideoManip();
    };
  }, [manip]);

  // media pipe blur
  // useEffect(() => {
  //   let trackProcessor: MediaStreamTrackProcessor<VideoFrame>;
  //   let trackGenerator: MediaStreamVideoTrackGenerator;
  //   if (stream.current && videoRef.current) {
  //     // if (bgMode !== BgMode.mediaPipeBlur) {
  //     //   if (videoRef.current) videoRef.current.srcObject = stream.current;
  //     //   return;
  //     // }

  //     const videoTrack = stream.current.getVideoTracks()[0];

  //     // create proccessor object that will handle frame changes
  //     const trackProcessor = new MediaStreamTrackProcessor({
  //       track: videoTrack,
  //     });
  //     // create generator which composes frames back into a stream
  //     const trackGenerator = new MediaStreamTrackGenerator({ kind: "video" });

  //     const canvas = new OffscreenCanvas(640, 360);
  //     // const context = canvas.getContext("2d", { willReadFrequently: true })!;

  //     let resultFrame = canvas;
  //     VideoManip.setFrameCB((c: OffscreenCanvas) => {
  //       resultFrame = c;
  //     });

  //     const transformer = new TransformStream({
  //       async transform(
  //         videoFrame: VideoFrame,
  //         controller: TransformStreamDefaultController
  //       ) {
  //         await VideoManip.sendFrame(videoFrame);

  //         // Create a new video frame from the canvas
  //         const blurredFrame = new VideoFrame(resultFrame, {
  //           timestamp: videoFrame.timestamp,
  //         });

  //         // Enqueue the blurred frame
  //         controller.enqueue(blurredFrame);

  //         // Close the original frame to free up resources
  //         videoFrame.close();
  //       },
  //     });

  //     trackProcessor.readable
  //       .pipeThrough(transformer)
  //       .pipeTo(trackGenerator.writable);

  //     const streamAfter = new MediaStream([trackGenerator]);

  //     if (videoRef.current) {
  //       videoRef.current.srcObject = streamAfter;
  //     }
  //   }

  //   return () => {
  //     try {
  //       // Close the generator
  //       if (trackGenerator) trackGenerator.stop();

  //       // Close the processor readable and generator writable streams
  //       if (trackProcessor) trackProcessor.readable.cancel();
  //       if (trackGenerator) trackGenerator.writable.abort();
  //     } catch (e) {
  //       console.error(e);
  //     }
  //   };
  // }, [bgMode]);

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

        <Button
          onClick={() =>
            setManip((p) => ({ ...p, mode: getNextBgMode(manip.mode) }))
          }
        >
          Mode : {manip.mode}
        </Button>
        <Button
          onClick={() =>
            setManip((p) => ({ ...p, algo: getNextSegAlgo(manip.algo) }))
          }
        >
          Algo : {manip.algo}
        </Button>
      </Box>
    </Box>
  );
}
