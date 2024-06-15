export class AudioVisualiser {
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
    if (!AudioVisualiser.audioContext) {
      AudioVisualiser.audioContext = new AudioContext();
    }

    AudioVisualiser.mediaElementSourceNode =
      src instanceof HTMLAudioElement
        ? AudioVisualiser.audioContext.createMediaElementSource(src)
        : AudioVisualiser.audioContext.createMediaStreamSource(src);

    AudioVisualiser.analyser = AudioVisualiser.audioContext.createAnalyser();
    AudioVisualiser.analyser.fftSize = 2048;
    AudioVisualiser.dataArray = new Uint8Array(
      AudioVisualiser.analyser.fftSize
    );

    AudioVisualiser.mediaElementSourceNode.connect(AudioVisualiser.analyser);
    AudioVisualiser.analyser.connect(AudioVisualiser.audioContext.destination);

    console.log({
      mediaElementSourceNode: AudioVisualiser.mediaElementSourceNode,
      analyser: AudioVisualiser.analyser,
    });

    AudioVisualiser.startDraw();
  }

  static setVisualiserCanvas(canvas: HTMLCanvasElement) {
    console.log("setVisualiserCanvas", canvas);
    AudioVisualiser.canvas = canvas;
    AudioVisualiser.canvasContext = canvas.getContext("2d");
  }

  private static drawVisualizer = 0;
  private static draw = () => {
    if (
      AudioVisualiser.analyser &&
      AudioVisualiser.dataArray &&
      AudioVisualiser.canvasContext &&
      AudioVisualiser.canvas
    ) {
      const canvas = AudioVisualiser.canvas;
      const canvasContext = AudioVisualiser.canvasContext;

      AudioVisualiser.analyser.getByteTimeDomainData(AudioVisualiser.dataArray);
      canvasContext.fillStyle = "rgb(200, 200, 200)";
      canvasContext.fillRect(0, 0, canvas.width, canvas.height);

      canvasContext.lineWidth = 2;
      canvasContext.strokeStyle = "rgb(0, 0, 0)";
      canvasContext.beginPath();

      const sliceWidth = canvas.width / AudioVisualiser.analyser.fftSize;
      let x = 0;

      for (let i = 0; i < AudioVisualiser.analyser.fftSize; i++) {
        const v = AudioVisualiser.dataArray[i] / 128.0;
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
    AudioVisualiser.drawVisualizer = requestAnimationFrame(
      AudioVisualiser.draw
    );
  };

  private static startDraw() {
    console.log("startDraw");
    AudioVisualiser.drawVisualizer = requestAnimationFrame(
      AudioVisualiser.draw
    );
  }

  static stopDraw() {
    console.log("stopDraw");
    cancelAnimationFrame(AudioVisualiser.drawVisualizer);

    // cleanup
    if (AudioVisualiser.audioContext) {
      AudioVisualiser.audioContext.close();
      AudioVisualiser.audioContext = null;
    }
    if (AudioVisualiser.mediaElementSourceNode) {
      AudioVisualiser.mediaElementSourceNode.disconnect();
      AudioVisualiser.mediaElementSourceNode = null;
    }
    if (AudioVisualiser.analyser) {
      AudioVisualiser.analyser.disconnect();
      AudioVisualiser.analyser = null;
    }
  }
}
