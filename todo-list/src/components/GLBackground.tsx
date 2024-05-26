import { Box, Slider, Typography } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import DropDownPopper from "./DropDownPopper";
import SettingsIcon from "@mui/icons-material/Settings";

function createShader(
  gl: WebGLRenderingContext,
  type: number,
  source: string
): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) {
    console.error("Error creating shader.");
    return null;
  }
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error("Error compiling shader:", gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function createProgram(
  gl: WebGLRenderingContext,
  vertexShader: WebGLShader,
  fragmentShader: WebGLShader
): WebGLProgram | null {
  const program = gl.createProgram();
  if (!program) {
    console.error("Error creating program.");
    return null;
  }
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error("Error linking program:", gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    return null;
  }
  return program;
}

const vertexShaderSource = `
  attribute vec4 a_position;
  void main() {
    gl_Position = a_position;
  }
`;

const fragmentShaderSource = `

  precision mediump float;
  uniform float u_time;
  uniform vec2 u_resolution;
  uniform vec3 u_color;
  uniform float u_blobSize;
  uniform vec3 u_bgColor;

  #define NUM_BLOBS 6

  void main() {
    vec2 st = gl_FragCoord.xy / u_resolution;
    st = st * 2.0 - 1.0;
    st.x *= u_resolution.x / u_resolution.y;

    vec2 blobs[NUM_BLOBS];
    // for (int i = 0; i < NUM_BLOBS; i++) {
    //   // float dist = length(st - blobs[i]);
    //   // value += u_blobSize / dist;

    //   float step = 2.0 / float(NUM_BLOBS);
    //   float istep = -1.0 +  float(i) * step;
    //   // vec2 center =  vec2(-1.0 + (step * float(i)) , 0.0);
    //   vec2 center =  vec2(istep , 0.0);
    //   float rotateRadius = 0.3;

    //   blobs[i] = center + vec2(sin(u_time), cos(u_time)) * rotateRadius;
    // }
    blobs[0] = vec2(0.5, 0.5) + vec2(sin(u_time), cos(u_time)) * 0.2;
    blobs[1] = vec2(-0.5, -0.5) + vec2(sin(u_time * 1.2), cos(u_time * 1.2)) * 0.3;
    blobs[2] = vec2(0.3, -0.5) + vec2(sin(u_time * 0.8), cos(u_time * 0.8)) * 0.25;
    blobs[3] = vec2(-0.3, 0.3) + vec2(sin(u_time * 1.5), cos(u_time * 1.5)) * 0.15;
    blobs[4] = vec2(0.0, 0.0) + vec2(sin(u_time * 2.0), cos(u_time * 2.0)) * 0.35;
    blobs[5] = vec2(0.8, -0.8) + vec2(sin(u_time * 1.0), cos(u_time * 1.0)) * 0.35;


    float value = 0.0;
    for (int i = 0; i < NUM_BLOBS; i++) {
      float dist = length(st - blobs[i]);
      value += u_blobSize / dist;
    }

    value = smoothstep(0.8, 1.0, value);
    
    vec3 color = u_color * value;

    // Combine the background color with the blob value
    vec3 finalColor = u_color * value + u_bgColor;

    // render final color
    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

const hexToRgb = (hex: string): [number, number, number] => {
  // Remove the hash symbol if it exists
  const trimmedHex = hex.replace(/^#/, "");

  // Parse r, g, b values
  const bigint = parseInt(trimmedHex, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;

  return [r, g, b];
};
function normRgbToHex([r, g, b]: number[]) {
  // Convert normalized RGB values to 0-255 range
  r = Math.round(r * 255);
  g = Math.round(g * 255);
  b = Math.round(b * 255);

  // Convert each component to hexadecimal and concatenate them
  const hex = ((r << 16) | (g << 8) | b).toString(16).padStart(6, "0");

  // Prepend '#' to the hexadecimal value
  return `#${hex}`;
}

class Renderer {
  static canvas: HTMLCanvasElement;
  static gl: WebGLRenderingContext;
  static program: WebGLProgram;

  // attributes
  static positionBuffer: WebGLBuffer | null;
  static positionAttributeLocation: number;

  //draw options (uniform)
  static uniformLocations = {
    u_resolution: null as WebGLUniformLocation | null,
    u_time: null as WebGLUniformLocation | null,
    u_color: null as WebGLUniformLocation | null,
    u_blobSize: null as WebGLUniformLocation | null,
    u_bgColor: null as WebGLUniformLocation | null,
  };

  static uniformValues = {
    uv_bgColor: [0.6, 0.8, 1.0],
    uv_blobSize: 0.1,
  };

  static init(canvas: HTMLCanvasElement) {
    const gl = canvas.getContext("webgl");
    if (!gl) {
      console.error("WebGL not supported");
      return;
    }

    Renderer.canvas = canvas;
    Renderer.gl = gl;

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(
      gl,
      gl.FRAGMENT_SHADER,
      fragmentShaderSource
    );
    if (!vertexShader || !fragmentShader) return;

    const program = createProgram(gl, vertexShader, fragmentShader);
    if (!program) return;

    Renderer.program = program;

    Renderer.resize();

    Renderer.start();
  }

  static resize() {
    Renderer.canvas.width = window.innerWidth;
    Renderer.canvas.height = window.innerHeight;
    if (Renderer.gl) {
      Renderer.gl.viewport(0, 0, Renderer.canvas.width, Renderer.canvas.height);
    }
  }

  static start() {
    if (!Renderer.gl || !Renderer.program) return;
    const gl = Renderer.gl; //just a shorter ref

    Renderer.positionAttributeLocation = gl.getAttribLocation(
      Renderer.program,
      "a_position"
    );

    // define unform variable locations (variables per full render)
    Renderer.uniformLocations = {
      u_resolution: gl.getUniformLocation(Renderer.program, "u_resolution"),
      u_time: gl.getUniformLocation(Renderer.program, "u_time"),
      u_color: gl.getUniformLocation(Renderer.program, "u_color"),
      u_blobSize: gl.getUniformLocation(Renderer.program, "u_blobSize"),
      u_bgColor: gl.getUniformLocation(Renderer.program, "u_bgColor"),
    };

    Renderer.positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, Renderer.positionBuffer);
    const positions = new Float32Array([
      -1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1,
    ]);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    requestAnimationFrame(Renderer.render);
  }

  static render(time: number) {
    if (!Renderer.gl || !Renderer.program) return;
    const gl = Renderer.gl; //just a shorter ref

    time *= 0.001; // change the movement speed here

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(Renderer.program);

    // pass attributes (per vertext variables)
    gl.bindBuffer(gl.ARRAY_BUFFER, Renderer.positionBuffer);
    gl.enableVertexAttribArray(Renderer.positionAttributeLocation);
    gl.vertexAttribPointer(
      Renderer.positionAttributeLocation,
      2,
      gl.FLOAT,
      false,
      0,
      0
    );

    const { u_resolution, u_time, u_color, u_blobSize, u_bgColor } =
      Renderer.uniformLocations;
    const { uv_bgColor, uv_blobSize } = Renderer.uniformValues;

    // pass uniform (full render variables)
    gl.uniform2f(u_resolution, gl.canvas.width, gl.canvas.height);
    gl.uniform1f(u_time, time);
    gl.uniform3f(u_color, -0.4, -0.6, -0.5); // 0.8, 0.2, 0.2 Change the color here (R, G, B)
    gl.uniform1f(u_blobSize, uv_blobSize);
    gl.uniform3f(u_bgColor, uv_bgColor[0], uv_bgColor[1], uv_bgColor[2]);

    gl.drawArrays(gl.TRIANGLES, 0, 6);

    //repeat
    requestAnimationFrame(Renderer.render);
  }
}

export default function GLBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // prepare GL and program
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    Renderer.init(canvasRef.current);
  }, []);

  // size and resize handler
  useEffect(() => {
    function resizeCanvas() {
      if (Renderer.canvas) {
        Renderer.resize();
      }
    }

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
    };
  }, []);

  const [blobSize, setBlobSize] = useState<number>(
    Renderer.uniformValues.uv_blobSize
  );
  const [color, setColor] = useState<string>(
    normRgbToHex(Renderer.uniformValues.uv_bgColor)
  );

  const handleSizeChange = (_event: Event, newValue: number | number[]) => {
    if (!Array.isArray(newValue)) {
      setBlobSize(newValue);
      Renderer.uniformValues.uv_blobSize = Number(newValue);
    }
  };

  const handleColorChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setColor(event.target.value);

    const normalized = hexToRgb(event.target.value).map((value) => value / 255);
    Renderer.uniformValues.uv_bgColor = normalized;
  };

  return (
    <>
      <Box sx={{ position: "absolute", top: 0, right: 0, padding: 1 }}>
        <DropDownPopper ButtonIcon={<SettingsIcon />}>
          <Typography variant="caption" gutterBottom>
            Blob Size {blobSize}
          </Typography>
          <Slider
            value={blobSize}
            onChange={handleSizeChange}
            valueLabelDisplay="auto"
            min={0.01}
            max={0.2}
            step={0.01}
          />
          <Typography variant="caption" gutterBottom>
            BgColor {color}
          </Typography>
          <input type="color" value={color} onChange={handleColorChange} />
        </DropDownPopper>
      </Box>
      <canvas
        style={{
          height: "100%",
          width: "100%",
          position: "absolute",
          top: 0,
          left: 0,
          background: "black",
          zIndex: -1,
        }}
        ref={canvasRef}
      />
    </>
  );
}
