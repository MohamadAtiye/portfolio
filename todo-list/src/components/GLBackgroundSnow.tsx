import { Box } from "@mui/material";
import { useEffect, useRef } from "react";
import { Renderer, createProgram } from "../helpers/webglWrapper";

// Vertex shader program
const vertexShaderSource = `
    attribute vec2 a_position;
    attribute float a_size;
    attribute float a_swayOffset;
    uniform vec2 u_resolution;
    uniform float u_time;
    varying float v_size;
    varying vec4 v_color;
    varying float v_isSun;
    void main() {
        vec2 position;
        float size;
        if (a_size == 0.0) { // Sun
            position = a_position;
            size = a_swayOffset; // Reuse a_swayOffset for sun size
            v_color = vec4(1.0, 1.0, 0.0, 1.0); // Yellow color for the sun
            v_isSun = 1.0;
        } else { // Snowflake
            float sway = 10.0 * sin(u_time * 0.001 + a_swayOffset);
            position = a_position + vec2(sway, 0.0);
            size = a_size;
            v_color = vec4(1.0, 1.0, 1.0, 1.0); // White color for snowflakes
            v_isSun = 0.0;
        }
        vec2 zeroToOne = position / u_resolution;
        vec2 zeroToTwo = zeroToOne * 2.0;
        vec2 clipSpace = zeroToTwo - 1.0;
        gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
        gl_PointSize = size;
        v_size = size;
    }
`;

// Fragment shader program
const fragmentShaderSource = `
    precision mediump float;
    uniform sampler2D u_texture;
    varying float v_size;
    varying vec4 v_color;
    varying float v_isSun;
    void main() {
        if (v_isSun == 1.0) {
            // Draw the sun as a solid color circle
            vec2 coord = gl_PointCoord - vec2(0.5);
            float dist = length(coord);
            if (dist > 0.5) {
                discard; // Outside the circle
            }
            gl_FragColor = v_color;
        } else {
            // Draw the snowflakes using the texture
            vec2 uv = gl_PointCoord;
            vec4 texColor = texture2D(u_texture, uv);
            if (texColor.a < 0.1) {
                discard;
            }
            gl_FragColor = texColor * v_color;
        }
    }
`;

const backgroundVertexShaderSource = `
    attribute vec2 a_position;
    varying vec2 v_position;
    void main() {
        v_position = a_position;
        gl_Position = vec4(a_position, 0, 1);
    }
`;
const backgroundFragmentShaderSource = `
    precision mediump float;
    uniform vec2 u_sunPosition;
    uniform vec2 u_resolution;
    varying vec2 v_position;

    void main() {
        vec2 position = (v_position + 1.0) / 2.0 * u_resolution;
        float sunHeight = u_sunPosition.y / u_resolution.y;
        
        // vec3 skyColorDay = vec3(135.0 / 255.0, 206.0 / 255.0, 235.0 / 255.0);
        vec3 skyColorDay = vec3(0.0 / 255.0, 170.0 / 255.0, 240.0 / 255.0);

        vec3 skyColorNight = vec3(32.0 / 255.0, 41.0 / 255.0, 61.0 / 255.0);
        vec3 color = mix(skyColorDay, skyColorNight, sunHeight);
        gl_FragColor = vec4(color, 1.0);
    }
`;

const start = (
  canvas: HTMLCanvasElement,
  gl: WebGLRenderingContext,
  program: WebGLProgram
) => {
  // Background shader program
  const backgroundProgram = createProgram(
    gl,
    backgroundVertexShaderSource,
    backgroundFragmentShaderSource
  );
  if (!backgroundProgram) return;

  // Locations for background program
  const bgPositionAttributeLocation = gl.getAttribLocation(
    backgroundProgram,
    "a_position"
  );
  const bgSunPositionUniformLocation = gl.getUniformLocation(
    backgroundProgram,
    "u_sunPosition"
  );
  const bgResolutionUniformLocation = gl.getUniformLocation(
    backgroundProgram,
    "u_resolution"
  );

  // Create buffer for background
  const bgPositionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, bgPositionBuffer);
  const bgPositions = new Float32Array([
    -1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1,
  ]);
  gl.bufferData(gl.ARRAY_BUFFER, bgPositions, gl.STATIC_DRAW);

  // Snowflake and sun program
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

  const snowflakeCount = 200;
  const positions = new Float32Array((snowflakeCount + 1) * 2); // +1 for the sun
  const sizes = new Float32Array(snowflakeCount + 1); // +1 for the sun
  const swayOffsets = new Float32Array(snowflakeCount + 1); // +1 for the sun
  const velocities = new Float32Array(snowflakeCount);

  for (let i = 0; i < snowflakeCount; i++) {
    positions[i * 2] = Math.random() * canvas.width;
    positions[i * 2 + 1] = Math.random() * canvas.height;
    sizes[i] = Math.random() * 30 + 5;
    // sizes[i] = Math.random() * 10 + 5;
    swayOffsets[i] = Math.random() * Math.PI * 2;
    velocities[i] = Math.random() * 2 + 1;
  }

  // Initialize sun position and size
  let sunPosition = [canvas.width / 4, canvas.height];
  const sunSize = Math.min(canvas.width, canvas.height) / 10;
  positions[snowflakeCount * 2] = sunPosition[0];
  positions[snowflakeCount * 2 + 1] = sunPosition[1];
  sizes[snowflakeCount] = 0.0; // Mark as sun
  swayOffsets[snowflakeCount] = sunSize; // Reuse swayOffsets for sun size

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

  function updateSunPosition(time: number) {
    const nightTime = 0.2;
    const speed = 0.00005;
    const t = (time * speed) % 1;
    const angle = t * (1 + nightTime) * Math.PI;
    positions[snowflakeCount * 2] =
      (canvas.width / 2) * (1 + Math.cos(angle) * 0.8); // 0.8 to narrow the horizontal radius
    positions[snowflakeCount * 2 + 1] =
      canvas.height * (1 - Math.sin(angle) * 0.9); //0.9 to narrow the vertical radius
    // canvas.height + canvas.height * (-Math.sin(angle) * 0.9); //0.9 to narrow the vertical radius

    if (positions[snowflakeCount * 2 + 1] > canvas.height)
      positions[snowflakeCount * 2 + 1] = canvas.height * 1.1;
    sunPosition = [
      positions[snowflakeCount * 2],
      positions[snowflakeCount * 2 + 1],
    ];
  }

  function render(time: number) {
    updateSnowflakes();
    updateSunPosition(time);

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Render background
    if (sunPosition[1] < canvas.height) {
      gl.useProgram(backgroundProgram);
      gl.uniform2f(
        bgResolutionUniformLocation,
        gl.canvas.width,
        gl.canvas.height
      );
      gl.uniform2f(
        bgSunPositionUniformLocation,
        sunPosition[0],
        sunPosition[1]
      );

      gl.bindBuffer(gl.ARRAY_BUFFER, bgPositionBuffer);
      gl.enableVertexAttribArray(bgPositionAttributeLocation);
      gl.vertexAttribPointer(
        bgPositionAttributeLocation,
        2,
        gl.FLOAT,
        false,
        0,
        0
      );

      gl.drawArrays(gl.TRIANGLES, 0, 6);
    }

    // Render snowflakes and sun
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

    gl.drawArrays(gl.POINTS, 0, snowflakeCount + 1);

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
