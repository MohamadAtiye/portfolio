import { useEffect, useRef } from "react";
import { VisualiserClass } from "../helpers/VisualiserClass";

export default function VisualiserVisualiser() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (canvasRef.current)
      VisualiserClass.setVisualiserCanvas(canvasRef.current);
  }, []);

  return (
    <>
      <canvas
        ref={canvasRef}
        width="1000"
        height="100"
        style={{ background: "rgb(200, 200, 200)" }}
      ></canvas>
    </>
  );
}
