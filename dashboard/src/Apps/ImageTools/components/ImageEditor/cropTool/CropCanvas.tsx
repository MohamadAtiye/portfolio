import { useEffect, useRef, useState } from "react";
import { useData } from "../../../helpers/useData";

export default function CropCanvas() {
  const { currentImage, activeActionData, submitChange } = useData();

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [outSize, setOutSize] = useState({ w: 0, h: 0 });
  const [modifier, setModifier] = useState(0);

  const [crop, setCrop] = useState({
    x: 0,
    y: 0,
    w: 0,
    h: 0,
  });

  // on crop option change => updates the crop{}
  useEffect(() => {
    if (!currentImage) {
      setCrop({ x: 0, y: 0, w: 0, h: 0 });
      return;
    }

    const o_h = currentImage.img.naturalHeight;
    const o_w = currentImage.img.naturalWidth;

    let newCrop = { x: 0, y: 0, w: o_w, h: o_h };

    if (activeActionData === "manual") {
      newCrop = { x: 0, y: 0, w: o_w, h: o_h };
    } else {
      const target = eval(activeActionData);
      const [tw, th] = activeActionData.split("/").map(Number);
      if (o_w / o_h > target) {
        const newW = (o_h * tw) / th;
        const diff = o_w - newW;
        newCrop = {
          x: diff / 2,
          y: 0,
          w: newW,
          h: o_h,
        };
      } else {
        const newH = (o_w * th) / tw;
        const diff = o_h - newH;
        newCrop = {
          x: 0,
          y: diff / 2,
          w: o_w,
          h: newH,
        };
      }
    }

    console.log(newCrop);
    setCrop(newCrop);
  }, [activeActionData, currentImage]);

  /////////////////////////////////////////////////////////////////////////////////

  // // handle applyEffect Event
  // useEffect(() => {
  //   function applyEffect() {
  //     console.log("applyEffect");
  //     if (!canvasRef.current || !currentImage) return;

  //     const { w, h } = outSize;
  //     const canvas = canvasRef.current;
  //     canvas.width = w;
  //     canvas.height = h;
  //     const ctx = canvas.getContext("2d")!;

  //     const crop = {
  //       t: 0,
  //       r: 0,
  //       b: 0,
  //       l: 0,
  //     };

  //     if (w > outSize.w) {
  //       crop.l = (w - outSize.w) / 2 + modifier;
  //       crop.r = (w - outSize.w) / 2 - modifier;
  //     }

  //     if (h > outSize.h) {
  //       crop.t = (h - outSize.h) / 2 + modifier;
  //       crop.b = (h - outSize.h) / 2 - modifier;
  //     }

  //     ctx.drawImage(currentImage.img, -crop.l, -crop.t);
  //     setModifier(0);

  //     // const imageData =
  //     const fullQuality = canvas.toDataURL("image/jpeg", 1.0); // Highest quality
  //     // const mediumQuality = canvas.toDataURL("image/jpeg", 0.5); // Medium quality
  //     // const lowQuality = canvas.toDataURL("image/jpeg", 0.1); // Low quality

  //     submitChange(fullQuality, `crop ${activeActionData}`);
  //   }
  //   window.addEventListener("applyEffect", applyEffect);
  //   return () => {
  //     window.removeEventListener("applyEffect", applyEffect);
  //   };
  // }, [activeActionData, modifier, outSize, currentImage, submitChange]);

  // // reset and calculate on change options
  // useEffect(() => {
  //   setModifier(0);
  //   if (!currentImage) return;

  //   if (activeActionData && activeActionData !== "manual") {
  //     const target = eval(activeActionData);
  //     const [tw, th] = activeActionData.split("/").map(Number);
  //     const h = currentImage.img.naturalHeight;
  //     const w = currentImage.img.naturalWidth;
  //     // const { w, h } = currentImage?.img.naturalHeight;
  //     if (w / h > target) {
  //       const newW = (h * tw) / th;
  //       const diff = w - newW;
  //       setOutSize({ w: w - diff, h: h });
  //     } else {
  //       const newH = (w * th) / tw;
  //       const diff = h - newH;
  //       setOutSize({ w: w, h: h - diff });
  //     }
  //   }
  // }, [activeActionData, currentImage]);

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

    // const crop = {
    //   t: 0,
    //   r: 0,
    //   b: 0,
    //   l: 0,
    // };

    // if (w > outSize.w) {
    //   crop.l = (w - outSize.w) / 2 + modifier;
    //   crop.r = (w - outSize.w) / 2 - modifier;
    // }

    // if (h > outSize.h) {
    //   crop.t = (h - outSize.h) / 2 + modifier;
    //   crop.b = (h - outSize.h) / 2 - modifier;
    // }

    // ctx.clearRect(0, 0, crop.l, h); //left
    // ctx.clearRect(w - crop.r, 0, crop.r, h); //right
    // ctx.clearRect(0, 0, w, crop.t); //top
    // ctx.clearRect(0, h - crop.b, w, crop.b); //bottom
  }, [crop.h, crop.w, crop.x, crop.y, currentImage]);

  // // handle mouse actions for modifier
  // useEffect(() => {
  //   if (!canvasRef.current || !currentImage) return;

  //   const h = currentImage.img.naturalHeight;
  //   const w = currentImage.img.naturalWidth;
  //   const canvas = canvasRef.current;

  //   const origin = { x: 0, y: 0 };
  //   canvas.onmousedown = (e) => {
  //     e.preventDefault();
  //     origin.x = e.offsetX;
  //     origin.y = e.offsetY;
  //   };
  //   canvas.onmousemove = (e) => {
  //     e.preventDefault();
  //     if (e.buttons === 1) {
  //       const diffX = origin.x - e.offsetX; // / box.width;
  //       const diffY = origin.y - e.offsetY; // / box.height;
  //       origin.x = e.offsetX;
  //       origin.y = e.offsetY;

  //       if (w > outSize.w) {
  //         const min = (outSize.w - w) / 2;
  //         const max = -min;
  //         setModifier((p) => {
  //           let newVal = p - diffX;
  //           if (newVal < min) newVal = min;
  //           if (newVal > max) newVal = max;
  //           return newVal;
  //         });
  //       }

  //       if (h > outSize.h) {
  //         const min = (outSize.h - h) / 2;
  //         const max = -min;
  //         setModifier((p) => {
  //           let newVal = p - diffY;
  //           if (newVal < min) newVal = min;
  //           if (newVal > max) newVal = max;
  //           return newVal;
  //         });
  //       }
  //     }
  //   };
  // }, [outSize.h, outSize.w, currentImage]);

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
      }}
    />
  );
}
