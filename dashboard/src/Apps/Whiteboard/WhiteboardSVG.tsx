import { Box, Button, Tooltip } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import simplify from "simplify-js";

import SaveAltOutlinedIcon from "@mui/icons-material/SaveAltOutlined";
import ModeIcon from "@mui/icons-material/Mode"; // Pen
import CircleOutlinedIcon from "@mui/icons-material/CircleOutlined";
import RectangleOutlinedIcon from "@mui/icons-material/RectangleOutlined";
import TextFieldsIcon from "@mui/icons-material/TextFields";
import OpenWithIcon from "@mui/icons-material/OpenWith"; // move icon
import ClearIcon from "@mui/icons-material/Clear";
import FormatColorFillIcon from "@mui/icons-material/FormatColorFill"; // fill icon

type Tool = "pen" | "eraser" | "ellipse" | "rectangle" | "text" | "move";
export default function WhiteboardSVG() {
  const svgRef = useRef<SVGSVGElement>(null);

  const fillRef = useRef(false);
  const [fill, setFill] = useState(false);

  const [lineWidth, setLineWidth] = useState(3);
  const lineWidthRef = useRef(3);

  const [color, setColor] = useState("#000000");
  const colorRef = useRef("#000000");
  const handleColorChange = (c: string) => {
    setColor(c);
    colorRef.current = c;
  };

  const toolRef = useRef<Tool>("pen");
  const [tool, setTool] = useState<Tool>("pen");
  const handleToolChange = (selectedTool: Tool) => {
    setTool(selectedTool);
    toolRef.current = selectedTool;
  };

  useEffect(() => {
    const svg = svgRef.current;
    let isDrawing = false;

    let isDragging = false;
    let selectedElement: SVGGraphicsElement | null = null;
    let ox = 0;
    let oy = 0;
    let offX = 0;
    let offY = 0;

    let currentPath: SVGPathElement | null = null;
    let points: { x: number; y: number }[] = [];
    let currentRect: SVGRectElement | null = null;
    let currentEllipse: SVGEllipseElement | null = null;
    let startX: number, startY: number;

    let eraser: SVGCircleElement | null = null;
    const distanceThreshold = 10; // Distance threshold for erasing

    let fill = fillRef.current;
    let color = colorRef.current;
    let lineWidth = lineWidthRef.current;

    const handleDown = (e: MouseEvent | TouchEvent) => {
      if (toolRef.current === "move") {
        const { offsetX, offsetY } = getEventPosition(e);

        selectedElement = getElementAtPosition(offsetX, offsetY);
        if (selectedElement) {
          offX = offsetX;
          offY = offsetY;
          isDragging = true;
          if (selectedElement instanceof SVGRectElement) {
            ox = Number(selectedElement.getAttribute("x"));
            oy = Number(selectedElement.getAttribute("y"));
          } else if (selectedElement instanceof SVGEllipseElement) {
            ox = Number(selectedElement.getAttribute("cx"));
            oy = Number(selectedElement.getAttribute("cy"));
          } else if (selectedElement instanceof SVGTextElement) {
            ox = Number(selectedElement.getAttribute("x"));
            oy = Number(selectedElement.getAttribute("y"));
          } else if (selectedElement instanceof SVGPathElement) {
            const pStr = selectedElement.getAttribute("d");
            const pointsArr = (pStr?.substring(1) ?? "").split(" ");
            points = pointsArr.map((p) => {
              const [x, y] = p.split(",");
              return { x: Number(x), y: Number(y) };
            });
          }
        }
      } else {
        isDrawing = true;
        color = colorRef.current;
        lineWidth = lineWidthRef.current;
        fill = fillRef.current;

        const { offsetX, offsetY } = getEventPosition(e);

        switch (toolRef.current) {
          case "pen":
            points = [
              { x: offsetX, y: offsetY },
              { x: offsetX, y: offsetY },
            ];
            startX = offsetX;
            startY = offsetY;
            currentPath = document.createElementNS(
              "http://www.w3.org/2000/svg",
              "path"
            );
            currentPath.setAttribute("stroke", color);
            currentPath.setAttribute("stroke-width", lineWidth.toString());
            currentPath.setAttribute("fill", fill ? color : "none");
            currentPath.setAttribute("stroke-linecap", "round");
            // eslint-disable-next-line no-case-declarations
            const d = `M${points.map((p) => `${p.x},${p.y}`).join(" ")}`;
            currentPath.setAttribute("d", d);

            svg?.appendChild(currentPath);
            break;
          case "eraser":
            svg
              ?.querySelectorAll("path, rect, ellipse,text")
              ?.forEach((path) => {
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
            currentRect.setAttribute("fill", fill ? color : "none");
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
            currentEllipse.setAttribute("fill", fill ? color : "none");
            currentEllipse.setAttribute("cx", startX.toString());
            currentEllipse.setAttribute("cy", startY.toString());
            svg?.appendChild(currentEllipse);
            break;
          case "text":
            startX = offsetX;
            startY = offsetY;
            // eslint-disable-next-line no-case-declarations
            const textContent = prompt("Enter text:");
            if (textContent) {
              const textElement = document.createElementNS(
                "http://www.w3.org/2000/svg",
                "text"
              );
              textElement.setAttribute("x", startX.toString());
              textElement.setAttribute("y", startY.toString());
              textElement.setAttribute("fill", color);
              textElement.setAttribute("font-size", (lineWidth * 8).toString());
              textElement.textContent = textContent;
              svg?.appendChild(textElement);
            }
            isDrawing = false; // No need to continue drawing for text
            break;
        }
      }
    };

    const handleUp = () => {
      // smooth the lines
      if (currentPath) {
        const tolerance = 2.5; // Adjust the tolerance as needed
        const highQuality = true; // High quality simplification
        const simplifiedPoints = simplify(points, tolerance, highQuality);

        const d = `M${simplifiedPoints.map((p) => `${p.x},${p.y}`).join(" ")}`;
        currentPath.setAttribute("d", d);
      }

      // no empty rect
      if (currentRect) {
        const w = currentRect.getAttribute("width");
        const h = currentRect.getAttribute("height");
        if (!w || !h) currentRect.remove();
      }

      // no empty ellipse
      if (currentEllipse) {
        const rx = currentEllipse.getAttribute("rx");
        const ry = currentEllipse.getAttribute("ry");
        if (!rx || !ry) currentEllipse.remove();
      }

      isDrawing = false;
      isDragging = false;
      currentPath = null;
      currentRect = null;
      currentEllipse = null;
      selectedElement = null;
    };

    const handleMove = (e: MouseEvent | TouchEvent) => {
      const { offsetX, offsetY } = getEventPosition(e);

      if (toolRef.current !== "eraser") {
        eraser?.remove();
        eraser = null;
      } else {
        if (!eraser) {
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

      if (!isDrawing && !isDragging) return;

      if (isDragging && selectedElement) {
        const dx = offsetX - offX;
        const dy = offsetY - offY;

        if (selectedElement instanceof SVGRectElement) {
          selectedElement.setAttribute("x", (ox + dx).toString());
          selectedElement.setAttribute("y", (oy + dy).toString());
        } else if (selectedElement instanceof SVGEllipseElement) {
          selectedElement.setAttribute("cx", (ox + dx).toString());
          selectedElement.setAttribute("cy", (oy + dy).toString());
        } else if (selectedElement instanceof SVGTextElement) {
          selectedElement.setAttribute("x", (ox + dx).toString());
          selectedElement.setAttribute("y", (oy + dy).toString());
        } else if (selectedElement instanceof SVGPathElement) {
          const d = `M${points
            .map((p) => `${p.x + dx},${p.y + dy}`)
            .join(" ")}`;
          selectedElement.setAttribute("d", d);
        }
        return;
      }

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
          svg
            ?.querySelectorAll("path, rect, ellipse, text")
            ?.forEach((path) => {
              if (isNearPath(offsetX, offsetY, path as SVGElement)) {
                svg?.removeChild(path);
              }
            });
          break;
      }
    };

    const getElementAtPosition = (
      x: number,
      y: number
    ): SVGGraphicsElement | null => {
      const elements = svg?.querySelectorAll("path, rect, ellipse, text") || [];
      for (const element of elements) {
        if (isNearPath(x, y, element as SVGElement)) {
          return element as SVGGraphicsElement;
        }
      }
      return null;
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
          const dx = (point.x - x) | 1;
          const dy = (point.y - y) | 1;
          if (Math.sqrt(dx * dx + dy * dy) < distanceThreshold) {
            return true;
          }
        }
      } else if (path instanceof SVGTextElement) {
        const box = path.getBBox();
        if (
          x > box.x &&
          x < box.x + box.width &&
          y > box.y &&
          y < box.y + box.height
        ) {
          return true;
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

  const exportSvg = () => {
    const svgElement = svgRef.current;
    if (!svgElement) return;

    // Serialize SVG to string
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svgElement);

    // Create a data URL from the SVG string
    const svgDataUrl = `data:image/svg+xml;base64,${btoa(svgString)}`;

    // Create an image element
    const image = new Image();
    image.src = svgDataUrl;

    image.onload = () => {
      // Create a canvas and draw the image on it
      const canvas = document.createElement("canvas");
      canvas.width = svgElement.clientWidth;
      canvas.height = svgElement.clientHeight;
      const context = canvas.getContext("2d");
      if (!context) return;
      context.drawImage(image, 0, 0);

      // Convert the canvas to a data URL
      const pngDataUrl = canvas.toDataURL("image/png");

      // Create a link element and download the image
      const link = document.createElement("a");
      link.href = pngDataUrl;
      link.download = "image.png";
      link.click();
    };
  };

  return (
    <Box
      sx={{
        height: "100%",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          background: "lightblue",
        }}
      >
        <Tooltip title="Pen">
          <Button
            size="small"
            onClick={() => handleToolChange("pen")}
            variant={tool === "pen" ? "contained" : "outlined"}
          >
            <ModeIcon />
          </Button>
        </Tooltip>
        <Tooltip title="Ellipse">
          <Button
            size="small"
            onClick={() => handleToolChange("ellipse")}
            variant={tool === "ellipse" ? "contained" : "outlined"}
          >
            <CircleOutlinedIcon />
          </Button>
        </Tooltip>
        <Tooltip title="Rectangle">
          <Button
            size="small"
            onClick={() => handleToolChange("rectangle")}
            variant={tool === "rectangle" ? "contained" : "outlined"}
          >
            <RectangleOutlinedIcon />
          </Button>
        </Tooltip>
        <Tooltip title="Text">
          <Button
            size="small"
            onClick={() => handleToolChange("text")}
            variant={tool === "text" ? "contained" : "outlined"}
          >
            <TextFieldsIcon />
          </Button>
        </Tooltip>
        <Tooltip title="Move">
          <Button
            size="small"
            onClick={() => handleToolChange("move")}
            variant={tool === "move" ? "contained" : "outlined"}
          >
            <OpenWithIcon />
          </Button>
        </Tooltip>
        <Tooltip title="Eraser">
          <Button
            size="small"
            onClick={() => handleToolChange("eraser")}
            variant={tool === "eraser" ? "contained" : "outlined"}
          >
            Eraser
          </Button>
        </Tooltip>
        <Tooltip title="Select Color">
          <input
            type="color"
            value={color}
            onChange={(e) => handleColorChange(e.target.value)}
          />
        </Tooltip>

        <Tooltip title="Fill Shapes">
          <Button
            size="small"
            onClick={() => {
              setFill((p) => !p);
              fillRef.current = !fillRef.current;
            }}
            variant={fill ? "contained" : "outlined"}
          >
            <FormatColorFillIcon />
          </Button>
        </Tooltip>

        <Tooltip title="Line Width">
          <input
            type="number"
            step={1}
            min={1}
            max={15}
            value={lineWidth}
            onChange={(e) => {
              setLineWidth(Number(e.target.value));
              lineWidthRef.current = Number(e.target.value);
            }}
            style={{ width: "50px" }}
          />
        </Tooltip>
        <Tooltip title="Clear">
          <Button variant="outlined" size="small" onClick={handleClear}>
            <ClearIcon />
          </Button>
        </Tooltip>
        <Tooltip title="Save">
          <Button variant="outlined" size="small" onClick={exportSvg}>
            <SaveAltOutlinedIcon />
          </Button>
        </Tooltip>
      </Box>
      <svg
        ref={svgRef}
        style={{
          height: "100%",
          width: "100%",
          backgroundColor: "white",
          userSelect: "none",
        }}
      />
    </Box>
  );
}
