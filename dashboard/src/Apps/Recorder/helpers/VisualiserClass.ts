export class VisualiserClass {
  private static audioContext = null as AudioContext | null;
  private static mediaElementSourceNode = null as
    | MediaElementAudioSourceNode
    | MediaStreamAudioSourceNode
    | null;
  private static analyser = null as AnalyserNode | null;
  private static dataArray = null as Uint8Array | null;

  private static canvas = null as HTMLCanvasElement | null;
  private static canvasContext = null as CanvasRenderingContext2D | null;

  static setupVisualizerForAudioElement(src: HTMLAudioElement | MediaStream) {
    console.log("setupVisualizerForAudioElement", src);

    // cleanup
    if (VisualiserClass.analyser) {
      VisualiserClass.analyser.disconnect();
      VisualiserClass.analyser = null;
    }
    if (VisualiserClass.mediaElementSourceNode) {
      VisualiserClass.mediaElementSourceNode.disconnect();
      VisualiserClass.mediaElementSourceNode = null;
    }
    if (VisualiserClass.audioContext) {
      VisualiserClass.audioContext.close();
      VisualiserClass.audioContext = null;
    }

    // start new

    VisualiserClass.audioContext = new AudioContext();

    VisualiserClass.analyser = VisualiserClass.audioContext.createAnalyser();
    VisualiserClass.analyser.fftSize = 2048;
    VisualiserClass.dataArray = new Uint8Array(
      VisualiserClass.analyser.fftSize
    );

    VisualiserClass.mediaElementSourceNode =
      src instanceof HTMLAudioElement
        ? VisualiserClass.audioContext.createMediaElementSource(src)
        : VisualiserClass.audioContext.createMediaStreamSource(src);

    VisualiserClass.mediaElementSourceNode.connect(VisualiserClass.analyser);
    VisualiserClass.analyser.connect(VisualiserClass.audioContext.destination);

    VisualiserClass.startDraw();
  }

  static setVisualiserCanvas(canvas: HTMLCanvasElement) {
    console.log("setVisualiserCanvas", canvas);
    VisualiserClass.canvas = canvas;
    VisualiserClass.canvasContext = canvas.getContext("2d");
  }

  private static drawVisualizer = 0;
  private static draw = () => {
    if (
      VisualiserClass.analyser &&
      VisualiserClass.dataArray &&
      VisualiserClass.canvasContext &&
      VisualiserClass.canvas
    ) {
      const canvas = VisualiserClass.canvas;
      const canvasContext = VisualiserClass.canvasContext;

      VisualiserClass.analyser.getByteTimeDomainData(VisualiserClass.dataArray);
      canvasContext.fillStyle = "rgb(200, 200, 200)";
      canvasContext.fillRect(0, 0, canvas.width, canvas.height);

      canvasContext.lineWidth = 2;
      canvasContext.strokeStyle = "rgb(0, 0, 0)";
      canvasContext.beginPath();

      const sliceWidth = canvas.width / VisualiserClass.analyser.fftSize;
      let x = 0;

      for (let i = 0; i < VisualiserClass.analyser.fftSize; i++) {
        const v = VisualiserClass.dataArray[i] / 128.0;
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
    VisualiserClass.drawVisualizer = requestAnimationFrame(
      VisualiserClass.draw
    );
  };

  private static startDraw() {
    console.log("startDraw");
    VisualiserClass.drawVisualizer = requestAnimationFrame(
      VisualiserClass.draw
    );
  }

  static stopDraw() {
    console.log("stopDraw");
    cancelAnimationFrame(VisualiserClass.drawVisualizer);

    // cleanup
    if (VisualiserClass.audioContext) {
      VisualiserClass.audioContext.close();
      VisualiserClass.audioContext = null;
    }
    if (VisualiserClass.mediaElementSourceNode) {
      VisualiserClass.mediaElementSourceNode.disconnect();
      VisualiserClass.mediaElementSourceNode = null;
    }
    if (VisualiserClass.analyser) {
      VisualiserClass.analyser.disconnect();
      VisualiserClass.analyser = null;
    }
  }
}
