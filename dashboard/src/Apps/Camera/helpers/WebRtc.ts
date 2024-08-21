export const resolutions = [
  { label: "800x480 (VGA)", value: "800x480" },
  { label: "1280x720 (HD)", value: "1280x720" },
  { label: "1920x1080 (Full HD)", value: "1920x1080" },
  { label: "2560x1440 (QHD)", value: "2560x1440" },
  { label: "3840x2160 (4K)", value: "3840x2160" },
];

export async function checkAndQueryCameraPermission(): Promise<
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

export async function listVideoDevices(): Promise<MediaDeviceInfo[]> {
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

export async function requestVideoStream(constraints: MediaTrackConstraints) {
  console.log("requestVideoStream", constraints);
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

export async function updateStream(
  stream: MediaStream,
  constraints: MediaTrackConstraints
) {
  console.log("updateStream", constraints);

  try {
    await stream.getVideoTracks()[0].applyConstraints(constraints);
  } catch (error) {
    console.error("error updating stream", constraints, error);
  }
}

export function applySobelFilter(
  pixels: Uint8ClampedArray,
  width: number,
  height: number
) {
  // Create temporary arrays to store gradient values
  const gradientX = new Float32Array(width * height);
  const gradientY = new Float32Array(width * height);

  // Sobel kernels for X and Y directions
  const sobelX = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
  const sobelY = [-1, -2, -1, 0, 0, 0, 1, 2, 1];

  // Compute gradients
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      let sumX = 0;
      let sumY = 0;

      // Convolve with Sobel kernels
      for (let ky = 0; ky < 3; ky++) {
        for (let kx = 0; kx < 3; kx++) {
          const pixelOffset = (y + ky - 1) * width + (x + kx - 1);
          const pixelValue = pixels[pixelOffset * 4]; // Assuming grayscale image

          sumX += sobelX[ky * 3 + kx] * pixelValue;
          sumY += sobelY[ky * 3 + kx] * pixelValue;
        }
      }

      // Store gradient magnitudes
      // const gradientMagnitude = Math.sqrt(sumX * sumX + sumY * sumY);
      gradientX[y * width + x] = sumX;
      gradientY[y * width + x] = sumY;
    }
  }

  // Combine gradients (e.g., using gradient magnitude)
  const edgePixels = new Uint8ClampedArray(width * height * 4);
  for (let i = 0; i < pixels.length; i += 4) {
    const magnitude = Math.sqrt(gradientX[i / 4] ** 2 + gradientY[i / 4] ** 2);
    const edgeValue = Math.min(255, magnitude); // Clamp to [0, 255]

    edgePixels[i] = edgeValue; // Red channel
    edgePixels[i + 1] = edgeValue; // Green channel
    edgePixels[i + 2] = edgeValue; // Blue channel
    edgePixels[i + 3] = 255; // Alpha channel (fully opaque)
  }

  return edgePixels;
}

// Create an offscreen canvas
const edgeCanvas = new OffscreenCanvas(100, 100);
const edgeCtx = edgeCanvas.getContext("2d")!;
export function detectEdgesAndDraw(videoFrame: VideoFrame) {
  edgeCanvas.width = videoFrame.displayWidth;
  edgeCanvas.height = videoFrame.displayHeight;

  // Draw the video frame onto the canvas
  edgeCtx.drawImage(videoFrame, 0, 0);

  // Get the image data (pixel values)
  const imageData = edgeCtx.getImageData(
    0,
    0,
    edgeCanvas.width,
    edgeCanvas.height
  );
  const pixels = imageData.data;

  // Apply Sobel filter
  const edgePixels = applySobelFilter(
    pixels,
    edgeCanvas.width,
    edgeCanvas.height
  );

  // Replace the original pixel data with the edge-detected pixels
  for (let i = 0; i < pixels.length; i += 4) {
    pixels[i] = edgePixels[i];
    pixels[i + 1] = edgePixels[i + 1];
    pixels[i + 2] = edgePixels[i + 2];
    // You can adjust the alpha channel (pixels[i + 3]) if needed
  }

  // Put the modified image data back onto the canvas
  edgeCtx.putImageData(imageData, 0, 0);

  return edgeCanvas;
}

export function applyEffects(
  os_canvas: OffscreenCanvas,
  os_context: OffscreenCanvasRenderingContext2D,
  videoFrame: VideoFrame,
  isFlip = false,
  isEdge = false,
  isBlur = false
) {
  const w = videoFrame.displayWidth;
  const h = videoFrame.displayHeight;

  // Set canvas dimensions
  os_canvas.width = w;
  os_canvas.height = h;

  // Clear the canvas
  os_context.clearRect(0, 0, w, h);

  // Draw the video frame on os_canvas
  os_context.drawImage(videoFrame, 0, 0, w, h);

  // Apply effects based on flags
  if (isFlip) os_context.scale(-1, 1);
  if (isBlur) os_context.filter = "blur(5px)";

  // draw the frame
  const drawSrc = isEdge ? detectEdgesAndDraw(videoFrame) : videoFrame;
  if (isFlip) os_context.drawImage(drawSrc, -w, 0, w, h);
  else os_context.drawImage(drawSrc, 0, 0, w, h);

  // restore
  if (isFlip) os_context.setTransform(1, 0, 0, 1, 0, 0); // Reset transformation
  if (isBlur) os_context.filter = "none"; // Reset filter
}
