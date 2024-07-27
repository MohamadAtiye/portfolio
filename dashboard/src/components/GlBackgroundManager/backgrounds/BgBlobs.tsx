import { useEffect, useRef, useState } from "react";
import {
  createProgram,
  createShader,
  hexToRgb,
  randomBetweenRange,
} from "./helpers";

const vertexShaderSource = `#version 300 es
in vec4 a_position;
void main() {
    gl_Position = a_position;
}
`;

const MAX_BLOBS = 20;
const fragmentShaderSource = `#version 300 es
precision highp float;

uniform float u_dataPoints[${MAX_BLOBS * 5}]; // Adjust size as necessary
uniform vec2 u_resolution;

uniform int u_count;

uniform float u_time;
uniform float u_speed;
uniform float u_size;

uniform vec4 u_bgColor;
uniform vec4 u_color;

out vec4 outColor;

void main() {
    vec2 r_xy = gl_FragCoord.xy;
    float g_blob_size = min(u_resolution[0], u_resolution[1]) * 0.5;
    
    float value = 0.0;
    for (int i = 0; i < u_count*5; i+=5){
        float cx = (u_dataPoints[i] + 1.0) *0.5 * u_resolution[0];
        float cy = (u_dataPoints[i + 1] + 1.0) * 0.5 * u_resolution[1];

        float pathRadius = u_dataPoints[i + 2] * g_blob_size;
        float speed = u_dataPoints[i + 3];
        float radius = u_dataPoints[i + 4] * u_size * g_blob_size;

        float x = cx + sin(u_time * u_speed * speed * 0.1) * pathRadius;
        float y = cy + cos(u_time * u_speed * speed * 0.1) * pathRadius;
        vec2 center = vec2(x,y);
        float dist = length(r_xy - center);
        value += radius / dist;
    }


    vec3 u_color_v3 = vec3(u_color[0],u_color[1],u_color[2]);
    vec3 u_bgColor_v3 = vec3(u_bgColor[0],u_bgColor[1],u_bgColor[2]);

    value = smoothstep(0.8, 1.0, value);
    
    // vec3 color = u_color_v3 * value;
    vec3 finalColor = mix(u_bgColor_v3, u_color_v3 * value, step(0.9, value));
    outColor = vec4(finalColor, 1.0);
}
`;

function createBlobPreset() {
  return {
    cx: randomBetweenRange(-0.7, 0.7),
    cy: randomBetweenRange(-0.7, 0.7),
    pathRadius: randomBetweenRange(0.1, 0.6),
    speed: randomBetweenRange(0.001, 0.005, 1000),
    radius: randomBetweenRange(0.1, 0.4),
  };
}

type BlobPresets = {
  cx: number;
  cy: number;
  pathRadius: number;
  speed: number;
  radius: number;
};

interface BgBlobsProps {
  bgColor: string;
  blobsColor: string;
  blobsSize: number;
  blobsSpeed: number;
  blobsCount: number;
}
export default function BgBlobs({
  bgColor,
  blobsColor,
  blobsSize,
  blobsSpeed,
  blobsCount,
}: BgBlobsProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glRef = useRef<WebGL2RenderingContext | null>(null);
  const [program, setProgram] = useState<WebGLProgram>();

  const blobsColorRef = useRef(hexToRgb(blobsColor));
  useEffect(() => {
    blobsColorRef.current = hexToRgb(blobsColor);
  }, [blobsColor]);

  const bgColorRef = useRef(hexToRgb(bgColor));
  useEffect(() => {
    bgColorRef.current = hexToRgb(bgColor);
  }, [bgColor]);

  const blobsSizeRef = useRef(blobsSize);
  useEffect(() => {
    blobsSizeRef.current = blobsSize / 100;
  }, [blobsSize]);

  const blobsSpeedRef = useRef(blobsSpeed);
  useEffect(() => {
    blobsSpeedRef.current = blobsSpeed;
  }, [blobsSpeed]);

  const blobPresets = useRef<BlobPresets[]>([]);
  useEffect(() => {
    const diff = blobsCount - blobPresets.current.length;
    const old = [...blobPresets.current];

    // add new random
    if (diff > 0) {
      for (let index = 0; index < diff; index++) {
        const element = createBlobPreset();
        old.push(element);
      }
    } else if (diff < 0) {
      for (let index = 0; index < -diff; index++) {
        old.pop();
      }
    }

    blobPresets.current = [...old];
  }, [blobsCount]);

  // initialize webgl2 and program
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl2");
    if (!gl) {
      console.error("WebGL2 not supported");
      return;
    }
    glRef.current = gl;

    // -- START CREATE PROGRAM
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(
      gl,
      gl.FRAGMENT_SHADER,
      fragmentShaderSource
    );
    if (!vertexShader || !fragmentShader) return;

    const newProgram = createProgram(gl, vertexShader, fragmentShader);
    if (!newProgram) return;

    setProgram(newProgram);
    // -- END CREATE PROGRAM
  }, []);

  // draw loop
  useEffect(() => {
    if (!program) return;
    const gl = glRef.current;
    if (!gl) return;

    let screen_w = window.innerWidth;
    let screen_h = window.innerHeight;
    const resizeCanvas = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;

        screen_w = window.innerWidth;
        screen_h = window.innerHeight;

        gl.viewport(0, 0, screen_w, screen_h);
      }
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Create a buffer for the vertex positions
    const positions = new Float32Array([
      -1,
      -1, // bottom left
      1,
      -1, // bottom right
      -1,
      1, // top left
      -1,
      1, // top left
      1,
      -1, // bottom right
      1,
      1, // top right
    ]);
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    // Bind position buffer to attribute in vertex shader
    const positionLocation = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    // define uniform variables
    const resolutionUniformLocation = gl.getUniformLocation(
      program,
      "u_resolution"
    );
    const bgColorUniformLocation = gl.getUniformLocation(program, "u_bgColor");
    const colorUniformLocation = gl.getUniformLocation(program, "u_color");
    const blobsCountLocation = gl.getUniformLocation(program, "u_count");
    const timeUniformLocation = gl.getUniformLocation(program, "u_time");
    const speedUniformLocation = gl.getUniformLocation(program, "u_speed");
    const sizeUniformLocation = gl.getUniformLocation(program, "u_size");
    const dataPointsLocation = gl.getUniformLocation(program, "u_dataPoints");

    let animator = 0;
    const drawScene = (time: number) => {
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.useProgram(program);

      // pass the resolution as u_resolution
      gl.uniform2f(resolutionUniformLocation, screen_w, screen_h);

      // pass the BgColor as u_bgColor
      const bgColor = bgColorRef.current;
      gl.uniform4f(
        bgColorUniformLocation,
        bgColor[0] / 255,
        bgColor[1] / 255,
        bgColor[2] / 255,
        1.0
      );

      // pass the BlobColor as u_color
      const color = blobsColorRef.current;
      gl.uniform4f(
        colorUniformLocation,
        color[0] / 255,
        color[1] / 255,
        color[2] / 255,
        1.0
      );

      // pass blobs count as u_count
      gl.uniform1i(blobsCountLocation, blobPresets.current.length);

      // pass time as u_time
      gl.uniform1f(timeUniformLocation, time);

      // pass global speed as u_speed
      gl.uniform1f(speedUniformLocation, blobsSpeedRef.current);

      // pass global size as u_size
      gl.uniform1f(sizeUniformLocation, blobsSizeRef.current);

      // pass dataPoints
      const dataPointsArray = new Float32Array(blobPresets.current.length * 5);
      blobPresets.current.forEach((dp, i) => {
        dataPointsArray[i * 5] = dp.cx;
        dataPointsArray[i * 5 + 1] = dp.cy;
        dataPointsArray[i * 5 + 2] = dp.pathRadius;
        dataPointsArray[i * 5 + 3] = dp.speed;
        dataPointsArray[i * 5 + 4] = dp.radius;
      });
      gl.uniform1fv(dataPointsLocation, dataPointsArray);

      gl.drawArrays(gl.TRIANGLES, 0, 6);

      animator = requestAnimationFrame(drawScene);
    };

    drawScene(0);

    return () => {
      cancelAnimationFrame(animator);
      window.removeEventListener("resize", resizeCanvas);
    };
  }, [program]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        height: "100%",
        width: "100%",
        position: "absolute",
        top: 0,
        left: 0,
        zIndex: -1,
      }}
    />
  );
}
