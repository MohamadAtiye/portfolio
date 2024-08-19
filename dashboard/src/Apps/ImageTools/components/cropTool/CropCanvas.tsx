import { useEffect, useRef } from "react";
import { useData } from "../../helpers/useData";

interface CropCanvasProps {
  crop: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
  setCrop: (val: { x: number; y: number; w: number; h: number }) => void;
}
export default function CropCanvas({ crop, setCrop }: CropCanvasProps) {
  const { currentImage } = useData();

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // copy crop to ref to avoid rerender
  const cropRef = useRef(crop);
  useEffect(() => {
    cropRef.current = crop;
  }, [crop]);

  // draw canvas
  useEffect(() => {
    if (!canvasRef.current || !currentImage) return;

    const h = currentImage.img.naturalHeight;
    const w = currentImage.img.naturalWidth;
    const canvas = canvasRef.current;
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d")!;

    ctx.drawImage(
      currentImage.img,
      crop.x,
      crop.y,
      crop.w,
      crop.h,
      crop.x,
      crop.y,
      crop.w,
      crop.h
    );
  }, [crop.h, crop.w, crop.x, crop.y, currentImage]);

  // handle mouse actions for crop modifier X,Y
  useEffect(() => {
    if (!canvasRef.current || !currentImage) return;

    const imgH = currentImage.img.naturalHeight;
    const imgW = currentImage.img.naturalWidth;
    const canvas = canvasRef.current;
    const bbox = canvas.getBoundingClientRect();

    const origin = { x: 0, y: 0 };

    const getEventPosition = (e: MouseEvent | TouchEvent) => {
      if (e instanceof MouseEvent) {
        return { x: e.offsetX, y: e.offsetY };
      } else if (e instanceof TouchEvent && e.touches.length > 0) {
        const rect = canvas.getBoundingClientRect();
        const touch = e.touches[0];
        return {
          x: touch.clientX - rect.left,
          y: touch.clientY - rect.top,
        };
      }
      return { x: 0, y: 0 };
    };

    function onDown(e: MouseEvent | TouchEvent) {
      const { x, y } = getEventPosition(e);
      origin.x = x;
      origin.y = y;
    }
    function onMove(e: MouseEvent | TouchEvent) {
      const { x, y } = getEventPosition(e);

      let diffX = x - origin.x; // / box.width;
      let diffY = y - origin.y; // / box.height;

      diffX = (imgW * diffX) / bbox.width;
      diffY = (imgH * diffY) / bbox.height;

      origin.x = x;
      origin.y = y;

      // check horizontal borders
      if (
        cropRef.current.x + cropRef.current.w + diffX > imgW ||
        cropRef.current.x + diffX < 0
      ) {
        diffX = 0;
      }

      // check horizontal borders
      if (
        cropRef.current.y + cropRef.current.h + diffY > imgH ||
        cropRef.current.y + diffY < 0
      ) {
        diffY = 0;
      }

      setCrop({
        ...cropRef.current,
        x: cropRef.current.x + diffX,
        y: cropRef.current.y + diffY,
      });
    }

    canvas.onmousedown = (e) => {
      e.preventDefault();
      onDown(e);
    };
    canvas.onmousemove = (e) => {
      e.preventDefault();
      if (e.buttons === 1) {
        onMove(e);
      }
    };

    canvas.addEventListener("touchstart", onDown, { passive: false });
    canvas.addEventListener("touchmove", onMove, { passive: false });

    return () => {
      canvas?.removeEventListener("touchstart", onDown);
      canvas?.removeEventListener("touchmove", onMove);
    };
  }, [currentImage, setCrop]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        objectFit: "contain",
        minWidth: "350px",
        position: "absolute",
        top: 0,
        left: 0,

        height: `100%`,
        width: `100%`,
        zIndex: 2,
        touchAction: "none",
      }}
    />
  );
}
