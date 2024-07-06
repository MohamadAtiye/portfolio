// generate canvas animation loop of text phrases moving from right to left and speed x
import React, { useRef, useEffect } from "react";

const Runner: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");

    if (!canvas || !context) {
      return;
    }

    let animationFrameId: number;

    const draw = (timestamp: number) => {
      // Clear the canvas
      context.clearRect(0, 0, canvas.width, canvas.height);

      // Example drawing: a rotating square
      const size = 50;
      const x = canvas.width / 2;
      const y = canvas.height / 2;
      const angle = (timestamp / 1000) * Math.PI;

      context.save();
      context.translate(x, y);
      context.rotate(angle);
      context.fillStyle = "blue";
      context.fillRect(-size / 2, -size / 2, size, size);
      context.restore();

      // Request the next frame
      animationFrameId = requestAnimationFrame(draw);
    };

    // Start the drawing loop
    animationFrameId = requestAnimationFrame(draw);

    // Cleanup function to stop the animation when the component unmounts
    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={800}
      height={600}
      style={{ border: "1px solid black" }}
    />
  );
};

export default Runner;
