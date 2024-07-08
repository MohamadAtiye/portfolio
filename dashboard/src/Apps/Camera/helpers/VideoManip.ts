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

function getCentroid(imageData: ImageData) {
  const { data, width, height } = imageData;
  let sumX = 0;
  let sumY = 0;
  let count = 0;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const index = (y * width + x) * 4; // RGBA values
      const alpha = data[index + 3]; // Use alpha channel to determine the presence of the person

      if (alpha > 0) {
        // Assuming non-transparent pixels represent the person
        sumX += x;
        sumY += y;
        count++;
      }
    }
  }

  const centroidX = sumX / count;
  const centroidY = sumY / count;

  return { x: centroidX, y: centroidY };
}

function detectLeaningDirection(canvas: OffscreenCanvas) {
  const ctx = canvas.getContext("2d")!;
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const centroid = getCentroid(imageData);
  const canvasCenterX = canvas.width / 2;

  if (centroid.x < canvasCenterX) {
    return "left";
  } else {
    return "right";
  }
}

export class VideoManip {
  manip = {
    algo: SegAlgo.pix,
    mode: BgMode.none,
  };

  trackProcessor: MediaStreamTrackProcessor<VideoFrame> | null = null;
  trackGenerator: MediaStreamVideoTrackGenerator | null = null;
  videoEl: HTMLVideoElement | null = null;
  streamAfter: MediaStream | null = null;

  seg_mask_result: Results | null = null;

  net: bodyPix.BodyPix | null = null;
  selfieSegmentation: SelfieSegmentation | null = null;
  constructor() {
    // initialize bodyPix selfie segmentation
    const loadBodyPix = async () => {
      try {
        const n = await bodyPix.load();
        this.net = n;
      } catch (e) {
        console.error(e);
      }
    };
    loadBodyPix();

    // initialize media pipe selfie segmentationm
    this.selfieSegmentation = new SelfieSegmentation({
      locateFile: (file: string) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/${file}`,
    });
    this.selfieSegmentation.setOptions({
      modelSelection: 1,
      selfieMode: true,
    });
  }

  // reusable canvas
  os_canvas = new OffscreenCanvas(640, 360);
  os_context = this.os_canvas.getContext("2d", {
    willReadFrequently: true,
  })!;

  // -- generic START - END
  isActive = false;
  startVideoManip = (
    stream: MediaStream,
    videoEl: HTMLVideoElement,
    manip: {
      algo: SegAlgo;
      mode: BgMode;
    }
  ) => {
    console.log("startVideoManip");
    this.isActive = true;
    this.manip = manip;
    const track = stream.getVideoTracks()[0];
    this.videoEl = videoEl;

    const os_canvas = this.os_canvas;
    const os_context = this.os_context;

    // for media pipe
    this.selfieSegmentation &&
      this.selfieSegmentation.onResults(this.onResults);

    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const vm = this;
    const transformer = new TransformStream({
      async transform(
        videoFrame: VideoFrame,
        controller: TransformStreamDefaultController
      ) {
        const w = videoFrame.displayWidth;
        const h = videoFrame.displayHeight;
        os_canvas.width = w;
        os_canvas.height = h;

        os_context.clearRect(0, 0, w, h);

        // draw background
        vm.renderBG(os_context, videoFrame);

        // draw person
        await vm.renderSegmentPerson(videoFrame, os_context);

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
    this.trackProcessor = new MediaStreamTrackProcessor({
      track: track,
    });
    // create generator which composes frames back into a stream
    this.trackGenerator = new MediaStreamTrackGenerator({
      kind: "video",
    });

    this.trackProcessor.readable
      .pipeThrough(transformer)
      .pipeTo(this.trackGenerator.writable);

    // create the output stream
    this.streamAfter = new MediaStream([this.trackGenerator]);
    this.videoEl.srcObject = this.streamAfter;
  };

  stopVideoManip = async () => {
    console.log("stopVideoManip");
    this.isActive = true;
    try {
      if (this.trackGenerator) {
        this.trackGenerator.stop();

        this.streamAfter &&
          this.streamAfter.getTracks().forEach((t) => {
            t.stop();
            this.streamAfter && this.streamAfter.removeTrack(t);
          });

        // const r =  this.trackGenerator.writable.getWriter();
        // r.releaseLock();
      }
      // if ( this.r) {
      //    this.r.releaseLock();
      //   await  this.r.abort();
      //   await  this.r.close();
      // }

      // // Abort the writable stream of the track generator
      // if ( this.trackGenerator &&  this.wr) {
      //   await  this.wr.close(); //.abort();
      //   await  this.wr.abort();
      // }

      // // Cancel the readable stream of the track processor
      // if ( this.trackProcessor &&  this.trackProcessor.readable) {
      //   await  this.re.cancel();
      // }

      // // Abort the writable stream of the track generator
      // if ( this.trackGenerator &&  this.trackGenerator.writable) {
      //   await  this.trackGenerator.writable.abort();
      // }

      // Clear the references (optional but good for garbage collection)
      this.trackProcessor = null;
      this.trackGenerator = null;
    } catch (e) {
      console.error(e);
    }
  };

  //////////////////////// canvas opps
  renderBG = (
    context: OffscreenCanvasRenderingContext2D,
    videoFrame: VideoFrame
  ) => {
    const manip = this.manip;
    const w = videoFrame.displayWidth;
    const h = videoFrame.displayHeight;

    context.save();
    if (manip.mode === BgMode.blur) {
      context.filter = "blur(10px)";
      context.drawImage(videoFrame, 0, 0, w, h);
      context.filter = "none";
    } else if (manip.mode === BgMode.mirror) {
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

  mask_canvas = new OffscreenCanvas(640, 360);
  mask_context = this.mask_canvas.getContext("2d", {
    willReadFrequently: true,
  })!;
  renderSegmentPerson = async (
    videoFrame: VideoFrame,
    context: OffscreenCanvasRenderingContext2D
  ) => {
    const manip = this.manip;
    const w = videoFrame.displayWidth;
    const h = videoFrame.displayHeight;

    const mask_context = this.mask_context;
    const mask_canvas = this.mask_canvas;

    mask_canvas.width = w;
    mask_canvas.height = h;

    mask_context.clearRect(0, 0, w, h);
    if (manip.algo === SegAlgo.mp) {
      await this.sendFrame(videoFrame);
      if (this.seg_mask_result) {
        mask_context.save();
        mask_context.scale(-1, 1);
        mask_context.drawImage(
          this.seg_mask_result.segmentationMask,
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
    } else if (manip.algo === SegAlgo.pix && this.net) {
      mask_context.drawImage(videoFrame, 0, 0, w, h);
      const segmentation = await this.net.segmentPerson(mask_canvas);
      const mask = bodyPix.toMask(segmentation);
      mask_context.clearRect(0, 0, w, h);
      mask_context.putImageData(mask, 0, 0);
      mask_context.globalCompositeOperation = "source-out";
      mask_context.drawImage(videoFrame, 0, 0, w, h);
    }

    if (manip.mode === BgMode.mirror) {
      const dir = detectLeaningDirection(mask_canvas);
      if (dir === "right")
        context.drawImage(mask_canvas, w / 2, 0, w, h, w / 2, 0, w, h);
      else {
        context.drawImage(mask_canvas, 0, 0, w / 2, h, 0, 0, w / 2, h);
      }
    } else {
      context.drawImage(mask_canvas, 0, 0);
    }

    // return mask_canvas;
  };

  //////////////////////// media pipe

  temp_canvas = document.createElement("canvas"); // HTMLCanvasElement();
  temp_context = this.temp_canvas.getContext("2d", {
    willReadFrequently: true,
  }) as CanvasRenderingContext2D;
  sendFrame = async (videoFrame: VideoFrame) => {
    this.temp_canvas.width = videoFrame.displayWidth;
    this.temp_canvas.height = videoFrame.displayHeight;

    // Draw the frame onto the canvas
    this.temp_context.drawImage(videoFrame, 0, 0);
    if (this.selfieSegmentation)
      await this.selfieSegmentation.send({ image: this.temp_canvas });
  };

  onResults = (results: Results) => {
    this.seg_mask_result = results;
  };
}
