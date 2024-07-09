/* eslint-disable no-inner-declarations */
import { Box } from "@mui/material";
import { useEffect, useRef, useState } from "react";

export default function Whiteboard() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);

  const [color, setColor] = useState("#000000");
  const colorRef = useRef("#000000");
  const handleColorChange = (c: string) => {
    setColor(c);
    colorRef.current = c;
  };

  const [lineWidth, setLineWidth] = useState(3);
  const lineWidthRef = useRef(3);
  const handleLineWidthChange = (w: number) => {
    setLineWidth(w);
    lineWidthRef.current = w;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d") ?? null;
    ctxRef.current = context;
    let isDrawing = false;

    let color = colorRef.current;
    let lineWidth = lineWidthRef.current;

    const setCanvasSize = () => {
      if (canvas && context) {
        const scale = window.devicePixelRatio || 1;
        const width = canvas.clientWidth * scale;
        const height = canvas.clientHeight * scale;
        canvas.width = width;
        canvas.height = height;
        context.scale(scale, scale);
      }
    };

    const handleDown = (e: MouseEvent | TouchEvent) => {
      isDrawing = true;
      if (color != colorRef.current) color = colorRef.current;
      if (lineWidth != lineWidthRef.current) lineWidth = lineWidthRef.current;

      const { offsetX, offsetY } = getEventPosition(e);
      if (context) {
        context.strokeStyle = color;
        context.lineWidth = lineWidth;
        context.lineJoin = "round";
        context.lineCap = "round";

        context.beginPath();
        context.moveTo(offsetX, offsetY);
      }
    };

    const handleUp = () => {
      isDrawing = false;
      if (context) {
        context.closePath();
      }
    };

    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (!isDrawing || !context) return;
      const { offsetX, offsetY } = getEventPosition(e);
      context.lineTo(offsetX, offsetY);
      context.stroke();
    };

    const getEventPosition = (e: MouseEvent | TouchEvent) => {
      if (e instanceof MouseEvent) {
        return { offsetX: e.offsetX, offsetY: e.offsetY };
      } else if (e instanceof TouchEvent && e.touches.length > 0) {
        const rect = canvas!.getBoundingClientRect();
        const touch = e.touches[0];
        return {
          offsetX: touch.clientX - rect.left,
          offsetY: touch.clientY - rect.top,
        };
      }
      return { offsetX: 0, offsetY: 0 };
    };

    setCanvasSize();
    window.addEventListener("resize", setCanvasSize);

    canvas?.addEventListener("mousedown", handleDown);
    canvas?.addEventListener("mouseup", handleUp);
    canvas?.addEventListener("mousemove", handleMove);
    canvas?.addEventListener("touchstart", handleDown);
    canvas?.addEventListener("touchend", handleUp);
    canvas?.addEventListener("touchmove", handleMove);

    return () => {
      window.removeEventListener("resize", setCanvasSize);
      canvas?.removeEventListener("mousedown", handleDown);
      canvas?.removeEventListener("mouseup", handleUp);
      canvas?.removeEventListener("mousemove", handleMove);
      canvas?.removeEventListener("touchstart", handleDown);
      canvas?.removeEventListener("touchend", handleUp);
      canvas?.removeEventListener("touchmove", handleMove);
    };
  }, []);

  return (
    <Box
      sx={{
        height: "100%",
      }}
    >
      <Box>
        color
        <input
          type="color"
          value={color}
          onChange={(e) => handleColorChange(e.target.value)}
        />
        line
        <input
          type="number"
          step={1}
          min={1}
          max={10}
          value={lineWidth}
          onChange={(e) => handleLineWidthChange(Number(e.target.value))}
          style={{ width: "50px" }}
        />
      </Box>
      <canvas
        ref={canvasRef}
        style={{ height: "100%", width: "100%", backgroundColor: "white" }}
      />
    </Box>
  );
}
