import * as bodyPix from "@tensorflow-models/body-pix";
import "@tensorflow/tfjs";
import { Results, SelfieSegmentation } from "@mediapipe/selfie_segmentation";

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

export enum BgMode {
  none = "none",
  blur = "blur",
  mirror = "mirror",
  image = "image",
  color = "color",
  clear = "clear",
}
export enum SegAlgo {
  pix = "pix", // bodyPix
  mp = "mp", // mediapipe
}

const bgModes = Object.values(BgMode);
const segAlgos = Object.values(SegAlgo);
export const getNextBgMode = (currentMode: BgMode): BgMode => {
  const currentIndex = bgModes.indexOf(currentMode);
  const nextIndex = (currentIndex + 1) % bgModes.length;
  return bgModes[nextIndex];
};
export const getNextSegAlgo = (currentMode: SegAlgo): SegAlgo => {
  const currentIndex = segAlgos.indexOf(currentMode);
  const nextIndex = (currentIndex + 1) % segAlgos.length;
  return segAlgos[nextIndex];
};

export class VideoManip {
  static manip = {
    algo: SegAlgo.pix,
    mode: BgMode.none,
  };

  static trackProcessor: MediaStreamTrackProcessor<VideoFrame> | null;
  static trackGenerator: MediaStreamVideoTrackGenerator | null;
  static videoEl: HTMLVideoElement;
  static streamAfter: MediaStream;

  static seg_mask_result: Results;

  // reusable canvas
  static os_canvas = new OffscreenCanvas(640, 360);
  static os_context = VideoManip.os_canvas.getContext("2d", {
    willReadFrequently: true,
  })!;

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

    const os_canvas = VideoManip.os_canvas;
    const os_context = VideoManip.os_context;

    // for media pipe
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

        console.time(`${rand}`);

        const w = videoFrame.displayWidth;
        const h = videoFrame.displayHeight;
        os_canvas.width = w;
        os_canvas.height = h;

        os_context.clearRect(0, 0, w, h);
        // draw background
        VideoManip.renderBG(os_context, videoFrame);

        // draw person
        const seg = await VideoManip.segmentPerson(videoFrame);
        os_context.drawImage(seg, 0, 0);

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

  //////////////////////// canvas opps
  static renderBG = (
    context: OffscreenCanvasRenderingContext2D,
    videoFrame: VideoFrame
  ) => {
    const manip = VideoManip.manip;
    const w = videoFrame.displayWidth;
    const h = videoFrame.displayHeight;

    context.save();
    if (manip.mode === BgMode.blur) {
      context.filter = "blur(10px)";
      context.drawImage(videoFrame, 0, 0, w, h);
      context.filter = "none";
    } else if (manip.mode === BgMode.mirror) {
      // TODO: expand on this
      context.scale(-1, 1);
      context.drawImage(videoFrame, 0, 0, -w, h);
    } else if (manip.mode === BgMode.image) {
      context.drawImage(backgroundImage, 0, 0, w, h);
    } else if (manip.mode === BgMode.color) {
      context.fillStyle = "green";
      context.fillRect(0, 0, w, h);
    } else if (manip.mode === BgMode.clear) {
      context.clearRect(0, 0, w, h);
    }

    context.restore();
  };

  static mask_canvas = new OffscreenCanvas(640, 360);
  static mask_context = VideoManip.mask_canvas.getContext("2d", {
    willReadFrequently: true,
  })!;
  static segmentPerson = async (videoFrame: VideoFrame) => {
    const manip = VideoManip.manip;
    const w = videoFrame.displayWidth;
    const h = videoFrame.displayHeight;

    const mask_context = VideoManip.mask_context;
    const mask_canvas = VideoManip.mask_canvas;

    mask_canvas.width = w;
    mask_canvas.height = h;

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
        mask_context.restore();
        mask_context.globalCompositeOperation = "source-in";
        mask_context.drawImage(videoFrame, 0, 0, w, h);
        mask_context.restore();
      }
    } else if (manip.algo === SegAlgo.pix) {
      mask_context.drawImage(videoFrame, 0, 0, w, h);
      const segmentation = await net.segmentPerson(mask_canvas);
      const mask = bodyPix.toMask(segmentation);
      mask_context.clearRect(0, 0, w, h);
      mask_context.putImageData(mask, 0, 0);
      mask_context.globalCompositeOperation = "source-out";
      mask_context.drawImage(videoFrame, 0, 0, w, h);
    }
    return mask_canvas;
  };

  //////////////////////// media pipe

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
  };
}
