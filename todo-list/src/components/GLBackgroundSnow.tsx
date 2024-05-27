import { Box } from "@mui/material";
import { useEffect, useRef } from "react";
import { Renderer } from "../helpers/webglWrapper";

// Vertex shader program
const vertexShaderSource = `
    attribute vec2 a_position;
    attribute float a_size;
    attribute float a_swayOffset;
    uniform vec2 u_resolution;
    uniform float u_time;
    varying float v_size;
    void main() {
        float sway = 10.0 * sin(u_time * 0.001 + a_swayOffset);
        vec2 position = a_position + vec2(sway, 0.0);
        vec2 zeroToOne = position / u_resolution;
        vec2 zeroToTwo = zeroToOne * 2.0;
        vec2 clipSpace = zeroToTwo - 1.0;
        gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
        gl_PointSize = a_size;
        v_size = a_size;
    }
`;

// Fragment shader program
const fragmentShaderSource = `
    precision mediump float;
    uniform sampler2D u_texture;
    varying float v_size;
    void main() {
        vec2 uv = gl_PointCoord;
        vec4 texColor = texture2D(u_texture, uv);
        if (texColor.a < 0.1) {
            discard;
        }
        gl_FragColor = texColor;
    }
`;

const start = (
  canvas: HTMLCanvasElement,
  gl: WebGLRenderingContext,
  program: WebGLProgram
) => {
  const positionAttributeLocation = gl.getAttribLocation(program, "a_position");
  const sizeAttributeLocation = gl.getAttribLocation(program, "a_size");
  const swayOffsetAttributeLocation = gl.getAttribLocation(
    program,
    "a_swayOffset"
  );
  const resolutionUniformLocation = gl.getUniformLocation(
    program,
    "u_resolution"
  );
  const timeUniformLocation = gl.getUniformLocation(program, "u_time");
  const textureUniformLocation = gl.getUniformLocation(program, "u_texture");

  const positionBuffer = gl.createBuffer();
  const sizeBuffer = gl.createBuffer();
  const swayOffsetBuffer = gl.createBuffer();

  const snowflakeCount = 1000;
  const positions = new Float32Array(snowflakeCount * 2);
  const sizes = new Float32Array(snowflakeCount);
  const swayOffsets = new Float32Array(snowflakeCount);
  const velocities = new Float32Array(snowflakeCount);

  for (let i = 0; i < snowflakeCount; i++) {
    positions[i * 2] = Math.random() * canvas.width;
    positions[i * 2 + 1] = Math.random() * canvas.height;
    sizes[i] = Math.random() * 10 + 5;
    swayOffsets[i] = Math.random() * Math.PI * 2;
    velocities[i] = Math.random() * 2 + 1;
  }

  function createTexture(gl: WebGLRenderingContext) {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);

    const pixel = new Uint8Array([255, 255, 255, 255]);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      1,
      1,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      pixel
    );

    const image = new Image();
    image.src = "snowflake.png";
    image.onload = function () {
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        image
      );
      gl.generateMipmap(gl.TEXTURE_2D);
    };

    return texture;
  }

  createTexture(gl);

  function updateSnowflakes() {
    for (let i = 0; i < snowflakeCount; i++) {
      positions[i * 2 + 1] += velocities[i];
      if (positions[i * 2 + 1] > canvas.height) {
        positions[i * 2 + 1] = 0;
      }
    }
  }

  function render(time: number) {
    updateSnowflakes();

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(program);
    gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);
    gl.uniform1f(timeUniformLocation, time);
    gl.uniform1i(textureUniformLocation, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.DYNAMIC_DRAW);
    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, sizeBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, sizes, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(sizeAttributeLocation);
    gl.vertexAttribPointer(sizeAttributeLocation, 1, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, swayOffsetBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, swayOffsets, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(swayOffsetAttributeLocation);
    gl.vertexAttribPointer(
      swayOffsetAttributeLocation,
      1,
      gl.FLOAT,
      false,
      0,
      0
    );

    gl.drawArrays(gl.POINTS, 0, snowflakeCount);

    requestAnimationFrame(render);
  }

  gl.clearColor(32 / 255, 41 / 255, 61 / 255, 1);
  requestAnimationFrame(render);
};

export default function GLBackgroundSnow() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // prepare GL and program
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    Renderer.init(
      canvasRef.current,
      vertexShaderSource,
      fragmentShaderSource,
      start
    );
  }, []);

  return (
    <>
      <Box sx={{ position: "absolute", top: 0, right: 0, padding: 1 }}></Box>
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
