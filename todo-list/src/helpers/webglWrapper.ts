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

export function createProgram(
  gl: WebGLRenderingContext,
  vertexShaderSource: string,
  fragmentShaderSource: string
): WebGLProgram | null {
  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  const fragmentShader = createShader(
    gl,
    gl.FRAGMENT_SHADER,
    fragmentShaderSource
  );
  if (!vertexShader || !fragmentShader) return null;

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

export class Renderer {
  static canvas: HTMLCanvasElement;
  static gl: WebGLRenderingContext;
  static program: WebGLProgram;

  static programIndex = 0;

  static init(
    canvas: HTMLCanvasElement,
    vertexShaderSource: string,
    fragmentShaderSource: string,
    callback: (
      canvas: HTMLCanvasElement,
      gl: WebGLRenderingContext,
      program: WebGLProgram
    ) => void
  ) {
    const gl = canvas.getContext("webgl");
    if (!gl) {
      console.error("WebGL not supported");
      return;
    }

    Renderer.canvas = canvas;
    Renderer.gl = gl;

    // FOR ALPHA CHANNEL transparency
    // Enable blending
    gl.enable(gl.BLEND);
    // Set the blending function
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    const program = createProgram(gl, vertexShaderSource, fragmentShaderSource);
    if (!program) return;

    Renderer.program = program;

    Renderer.resize();
    window.addEventListener("resize", Renderer.resize);

    callback && callback(canvas, gl, program);
  }

  static resize() {
    Renderer.canvas.width = window.innerWidth;
    Renderer.canvas.height = window.innerHeight;
    if (Renderer.gl) {
      Renderer.gl.viewport(0, 0, Renderer.canvas.width, Renderer.canvas.height);
    }
  }
}
