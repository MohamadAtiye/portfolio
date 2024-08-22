const FFTSIZE = 2048;

export class VisualiserClass {
  private static audioContext = null as AudioContext | null;
  private static mediaElementSourceNode = null as
    | MediaElementAudioSourceNode
    | MediaStreamAudioSourceNode
    | null;
  private static analyser = null as AnalyserNode | null;

  private static canvas = null as HTMLCanvasElement | null;
  private static canvasContext = null as CanvasRenderingContext2D | null;

  static setupVisualizerForAudioElement(src: MediaStream) {
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

    VisualiserClass.oldDataArrays = Array.from(
      { length: VisualiserClass.smoother },
      () => new Uint8Array(FFTSIZE)
    );

    // start new

    VisualiserClass.audioContext = new AudioContext();

    VisualiserClass.analyser = VisualiserClass.audioContext.createAnalyser();
    VisualiserClass.analyser.fftSize = FFTSIZE;

    VisualiserClass.mediaElementSourceNode =
      VisualiserClass.audioContext.createMediaStreamSource(src);

    VisualiserClass.mediaElementSourceNode.connect(VisualiserClass.analyser);
    VisualiserClass.analyser.connect(VisualiserClass.audioContext.destination);

    VisualiserClass.startDraw();
  }

  static setVisualiserCanvas(canvas: HTMLCanvasElement) {
    VisualiserClass.canvas = canvas;
    VisualiserClass.canvasContext = canvas.getContext("2d");
  }

  private static drawVisualizer = 0;
  private static smoother = 2;
  private static oldDataArrays = Array.from(
    { length: VisualiserClass.smoother },
    () => new Uint8Array(FFTSIZE)
  );
  // [
  //   new Uint8Array(FFTSIZE),
  //   new Uint8Array(FFTSIZE),
  // ];

  private static draw = () => {
    if (
      VisualiserClass.analyser &&
      VisualiserClass.canvasContext &&
      VisualiserClass.canvas
    ) {
      const canvas = VisualiserClass.canvas;
      const canvasContext = VisualiserClass.canvasContext;

      const dataArray = new Uint8Array(VisualiserClass.analyser.fftSize);
      VisualiserClass.analyser.getByteTimeDomainData(dataArray);
      canvasContext.fillStyle = "rgb(200, 200, 200)";
      canvasContext.fillRect(0, 0, canvas.width, canvas.height);

      canvasContext.lineWidth = 2;
      canvasContext.strokeStyle = "rgb(0, 0, 0)";
      canvasContext.beginPath();

      const sliceWidth = canvas.width / VisualiserClass.analyser.fftSize;
      let x = 0;

      for (let i = 0; i < VisualiserClass.analyser.fftSize; i++) {
        //smoothing
        const count = VisualiserClass.oldDataArrays.length + 1;
        const sum =
          VisualiserClass.oldDataArrays.reduce((p, c) => p + c[i], 0) +
          dataArray[i];
        const final = sum / count;

        const v = final / 128.0;
        // const v = dataArray[i] / 128.0;
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

      VisualiserClass.oldDataArrays.pop();
      VisualiserClass.oldDataArrays = [
        dataArray,
        ...VisualiserClass.oldDataArrays,
      ];
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
