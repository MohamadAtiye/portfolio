import { useEffect, useRef } from "react";

// src/webgl-utils.ts

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

  #define NUM_BLOBS 5

  void main() {
    vec2 st = gl_FragCoord.xy / u_resolution;
    st = st * 2.0 - 1.0;
    st.x *= u_resolution.x / u_resolution.y;

    vec2 blobs[NUM_BLOBS];
    blobs[0] = vec2(0.5, 0.5) + vec2(sin(u_time), cos(u_time)) * 0.2;
    blobs[1] = vec2(-0.5, -0.5) + vec2(sin(u_time * 1.2), cos(u_time * 1.2)) * 0.3;
    blobs[2] = vec2(0.3, -0.5) + vec2(sin(u_time * 0.8), cos(u_time * 0.8)) * 0.25;
    blobs[3] = vec2(-0.3, 0.3) + vec2(sin(u_time * 1.5), cos(u_time * 1.5)) * 0.15;
    blobs[4] = vec2(0.0, 0.0) + vec2(sin(u_time * 2.0), cos(u_time * 2.0)) * 0.35;

    float value = 0.0;
    for (int i = 0; i < NUM_BLOBS; i++) {
      float dist = length(st - blobs[i]);
      value += u_blobSize / dist;
    }

    value = smoothstep(0.8, 1.0, value);

    vec3 color = u_color * value;
    gl_FragColor = vec4(color, 1.0);
  }
`;

export default function GLBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl");
    if (!gl) {
      console.error("WebGL not supported");
      return;
    }

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(
      gl,
      gl.FRAGMENT_SHADER,
      fragmentShaderSource
    );
    if (!vertexShader || !fragmentShader) return;

    const program = createProgram(gl, vertexShader, fragmentShader);
    if (!program) return;

    const positionAttributeLocation = gl.getAttribLocation(
      program,
      "a_position"
    );
    const resolutionUniformLocation = gl.getUniformLocation(
      program,
      "u_resolution"
    );
    const timeUniformLocation = gl.getUniformLocation(program, "u_time");
    const colorUniformLocation = gl.getUniformLocation(program, "u_color");
    const blobSizeUniformLocation = gl.getUniformLocation(
      program,
      "u_blobSize"
    );

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    const positions = new Float32Array([
      -1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1,
    ]);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    const render = (time: number) => {
      time *= 0.001;

      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
      gl.clear(gl.COLOR_BUFFER_BIT);

      gl.useProgram(program);

      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.enableVertexAttribArray(positionAttributeLocation);
      gl.vertexAttribPointer(
        positionAttributeLocation,
        2,
        gl.FLOAT,
        false,
        0,
        0
      );

      gl.uniform2f(
        resolutionUniformLocation,
        gl.canvas.width,
        gl.canvas.height
      );
      gl.uniform1f(timeUniformLocation, time);
      gl.uniform3f(colorUniformLocation, 0.8, 0.2, 0.3); // 0.8, 0.2, 0.2 Change the color here (R, G, B)
      gl.uniform1f(blobSizeUniformLocation, 0.2); // 0.3 Change the size of the blobs here

      gl.drawArrays(gl.TRIANGLES, 0, 6);

      requestAnimationFrame(render);
    };

    requestAnimationFrame(render);
  }, []);

  return (
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
  );
}
