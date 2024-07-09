import { Box, Button } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import simplify from "simplify-js";

type Tool = "pen" | "eraser" | "ellipse" | "rectangle";
export default function WhiteboardSVG() {
  const svgRef = useRef<SVGSVGElement>(null);
  const toolRef = useRef<Tool>("pen");
  const [tool, setTool] = useState<Tool>("pen");

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

  const handleToolChange = (selectedTool: Tool) => {
    setTool(selectedTool);
    toolRef.current = selectedTool;
  };

  useEffect(() => {
    const svg = svgRef.current;
    let isDrawing = false;
    let currentPath: SVGPathElement | null = null;
    let points: { x: number; y: number }[] = [];
    let currentRect: SVGRectElement | null = null;
    let currentEllipse: SVGEllipseElement | null = null;
    let startX: number, startY: number;

    let eraser: SVGCircleElement | null = null;
    const distanceThreshold = 10; // Distance threshold for erasing

    let color = colorRef.current;
    let lineWidth = lineWidthRef.current;

    const handleDown = (e: MouseEvent | TouchEvent) => {
      isDrawing = true;
      if (color !== colorRef.current) color = colorRef.current;
      if (lineWidth !== lineWidthRef.current) lineWidth = lineWidthRef.current;

      const { offsetX, offsetY } = getEventPosition(e);

      switch (toolRef.current) {
        case "pen":
          points = [{ x: offsetX, y: offsetY }];
          startX = offsetX;
          startY = offsetY;
          currentPath = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "path"
          );
          currentPath.setAttribute("stroke", color);
          currentPath.setAttribute("stroke-width", lineWidth.toString());
          currentPath.setAttribute("fill", "none");
          svg?.appendChild(currentPath);
          break;
        case "eraser":
          svg?.querySelectorAll("path, rect, ellipse")?.forEach((path) => {
            if (isNearPath(offsetX, offsetY, path as SVGElement)) {
              svg?.removeChild(path);
            }
          });
          break;
        case "rectangle":
          startX = offsetX;
          startY = offsetY;
          currentRect = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "rect"
          );
          currentRect.setAttribute("stroke", color);
          currentRect.setAttribute("stroke-width", lineWidth.toString());
          currentRect.setAttribute("fill", "none");
          currentRect.setAttribute("x", startX.toString());
          currentRect.setAttribute("y", startY.toString());
          svg?.appendChild(currentRect);
          break;
        case "ellipse":
          startX = offsetX;
          startY = offsetY;
          currentEllipse = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "ellipse"
          );
          currentEllipse.setAttribute("stroke", color);
          currentEllipse.setAttribute("stroke-width", lineWidth.toString());
          currentEllipse.setAttribute("fill", "none");
          currentEllipse.setAttribute("cx", startX.toString());
          currentEllipse.setAttribute("cy", startY.toString());
          svg?.appendChild(currentEllipse);
          break;
      }
    };

    const handleUp = () => {
      if (currentPath) {
        const tolerance = 2.5; // Adjust the tolerance as needed
        const highQuality = true; // High quality simplification
        const simplifiedPoints = simplify(points, tolerance, highQuality);

        const d = `M${simplifiedPoints.map((p) => `${p.x},${p.y}`).join(" ")}`;
        currentPath.setAttribute("d", d);
      }

      isDrawing = false;
      currentPath = null;
      currentRect = null;
      currentEllipse = null;
    };

    const handleMove = (e: MouseEvent | TouchEvent) => {
      const { offsetX, offsetY } = getEventPosition(e);

      if (toolRef.current !== "eraser") {
        eraser?.remove();
        eraser = null;
      } else {
        if (!eraser) {
          console.log("create eraser");
          eraser = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "circle"
          );
          eraser.setAttribute("r", distanceThreshold.toString());
          eraser.setAttribute("stroke", "#000000");
          eraser.setAttribute("stroke-width", "2");
          eraser.setAttribute("fill", "none");
          svg?.appendChild(eraser);
        }

        eraser.setAttribute("cx", offsetX.toString());
        eraser.setAttribute("cy", offsetY.toString());
      }

      if (!isDrawing) return;

      switch (toolRef.current) {
        case "pen":
          if (currentPath) {
            points.push({ x: offsetX, y: offsetY });
            const d = `M${points.map((p) => `${p.x},${p.y}`).join(" ")}`;
            currentPath.setAttribute("d", d);
          }
          break;
        case "rectangle":
          if (currentRect) {
            const width = Math.abs(offsetX - startX);
            const height = Math.abs(offsetY - startY);
            currentRect.setAttribute("width", width.toString());
            currentRect.setAttribute("height", height.toString());
            if (offsetX < startX) {
              currentRect.setAttribute("x", offsetX.toString());
            }
            if (offsetY < startY) {
              currentRect.setAttribute("y", offsetY.toString());
            }
          }
          break;
        case "ellipse":
          if (currentEllipse) {
            const rx = Math.abs(offsetX - startX) / 2;
            const ry = Math.abs(offsetY - startY) / 2;
            const cx = (startX + offsetX) / 2;
            const cy = (startY + offsetY) / 2;

            currentEllipse.setAttribute("cx", cx.toString());
            currentEllipse.setAttribute("cy", cy.toString());
            currentEllipse.setAttribute("rx", rx.toString());
            currentEllipse.setAttribute("ry", ry.toString());
          }
          break;
        case "eraser":
          svg?.querySelectorAll("path, rect, ellipse")?.forEach((path) => {
            if (isNearPath(offsetX, offsetY, path as SVGElement)) {
              svg?.removeChild(path);
            }
          });
          break;
      }
    };

    const getEventPosition = (e: MouseEvent | TouchEvent) => {
      if (e instanceof MouseEvent) {
        return { offsetX: e.offsetX, offsetY: e.offsetY };
      } else if (e instanceof TouchEvent && e.touches.length > 0) {
        const rect = svg!.getBoundingClientRect();
        const touch = e.touches[0];
        return {
          offsetX: touch.clientX - rect.left,
          offsetY: touch.clientY - rect.top,
        };
      }
      return { offsetX: 0, offsetY: 0 };
    };

    const isNearPath = (x: number, y: number, path: SVGElement) => {
      if (path instanceof SVGPathElement) {
        const pathLength = path.getTotalLength();
        for (let i = 0; i < pathLength; i++) {
          const point = path.getPointAtLength(i);
          const dx = point.x - x;
          const dy = point.y - y;
          if (Math.sqrt(dx * dx + dy * dy) < distanceThreshold) {
            return true;
          }
        }
      } else if (path instanceof SVGRectElement) {
        const rectX = parseFloat(path.getAttribute("x") || "0");
        const rectY = parseFloat(path.getAttribute("y") || "0");
        const rectWidth = parseFloat(path.getAttribute("width") || "0");
        const rectHeight = parseFloat(path.getAttribute("height") || "0");

        // Check if the cursor is near the edges of the rectangle
        const isNearLeftEdge =
          x >= rectX - distanceThreshold &&
          x <= rectX + distanceThreshold &&
          y >= rectY &&
          y <= rectY + rectHeight;
        const isNearRightEdge =
          x >= rectX + rectWidth - distanceThreshold &&
          x <= rectX + rectWidth + distanceThreshold &&
          y >= rectY &&
          y <= rectY + rectHeight;
        const isNearTopEdge =
          y >= rectY - distanceThreshold &&
          y <= rectY + distanceThreshold &&
          x >= rectX &&
          x <= rectX + rectWidth;
        const isNearBottomEdge =
          y >= rectY + rectHeight - distanceThreshold &&
          y <= rectY + rectHeight + distanceThreshold &&
          x >= rectX &&
          x <= rectX + rectWidth;

        if (
          isNearLeftEdge ||
          isNearRightEdge ||
          isNearTopEdge ||
          isNearBottomEdge
        ) {
          return true;
        }
      } else if (path instanceof SVGEllipseElement) {
        const ellipseX = parseFloat(path.getAttribute("cx") || "0");
        const ellipseY = parseFloat(path.getAttribute("cy") || "0");
        const radiusX = parseFloat(path.getAttribute("rx") || "0");
        const radiusY = parseFloat(path.getAttribute("ry") || "0");

        // Calculate the distance from the cursor to the edge of the ellipse
        const dx = (x - ellipseX) / radiusX;
        const dy = (y - ellipseY) / radiusY;
        const distanceFromEdge = Math.sqrt(dx * dx + dy * dy);

        // Check if the cursor is near the edge of the ellipse
        if (
          Math.abs(distanceFromEdge - 1) * Math.min(radiusX, radiusY) <
          distanceThreshold
        ) {
          return true;
        }
      }

      return false;
    };

    svg?.addEventListener("mousedown", handleDown);
    svg?.addEventListener("mouseup", handleUp);
    svg?.addEventListener("mousemove", handleMove);
    svg?.addEventListener("touchstart", handleDown);
    svg?.addEventListener("touchend", handleUp);
    svg?.addEventListener("touchmove", handleMove);

    return () => {
      svg?.removeEventListener("mousedown", handleDown);
      svg?.removeEventListener("mouseup", handleUp);
      svg?.removeEventListener("mousemove", handleMove);
      svg?.removeEventListener("touchstart", handleDown);
      svg?.removeEventListener("touchend", handleUp);
      svg?.removeEventListener("touchmove", handleMove);
    };
  }, []);

  const handleClear = () => {
    const svg = svgRef.current;
    while (svg?.firstChild) {
      svg.removeChild(svg.firstChild);
    }
  };

  return (
    <Box
      sx={{
        height: "100%",
      }}
    >
      <Box>
        <Button
          onClick={() => handleToolChange("pen")}
          variant={tool === "pen" ? "contained" : "outlined"}
        >
          Pen
        </Button>
        <Button
          onClick={() => handleToolChange("eraser")}
          variant={tool === "eraser" ? "contained" : "outlined"}
        >
          Eraser
        </Button>
        <Button
          onClick={() => handleToolChange("ellipse")}
          variant={tool === "ellipse" ? "contained" : "outlined"}
        >
          Ellipse
        </Button>
        <Button
          onClick={() => handleToolChange("rectangle")}
          variant={tool === "rectangle" ? "contained" : "outlined"}
        >
          Rectangle
        </Button>

        <input
          type="color"
          value={color}
          onChange={(e) => handleColorChange(e.target.value)}
          disabled={tool === "eraser"}
        />
        <input
          type="number"
          step={1}
          min={1}
          max={10}
          value={lineWidth}
          onChange={(e) => handleLineWidthChange(Number(e.target.value))}
          style={{ width: "50px" }}
        />
        <Button onClick={handleClear}>Clear</Button>
      </Box>
      <svg
        ref={svgRef}
        style={{ height: "100%", width: "100%", backgroundColor: "white" }}
      />
    </Box>
  );
}
