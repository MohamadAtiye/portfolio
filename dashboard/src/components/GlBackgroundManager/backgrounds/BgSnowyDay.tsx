import { useEffect, useRef, useState } from "react";
import { createProgram, createShader } from "./helpers";

const vertexShaderSource = `#version 300 es
in vec4 a_position;
void main() {
    gl_Position = a_position;
}
`;

// step(v1,v2); returns 1.0 if v1>v2 else 0.0

const fragmentShaderSource = `#version 300 es
precision highp float;

uniform vec2 u_resolution;
uniform float u_time;
uniform float u_speed;

out vec4 outColor;

void main() {
    vec2 r_xy = gl_FragCoord.xy;

    float SUN_SIZE = 50.0;
    float MOON_SIZE = 30.0;

    // define colors
    vec3 colorBreak = vec3(255.0 / 255.0, 94.0 / 255.0, 77.0 / 255.0); // Red gradient bottom color
    vec3 colorNight = vec3(32.0 / 255.0, 41.0 / 255.0, 61.0 / 255.0); // Navy blue top color
    vec3 colorDay = vec3(0.0 / 255.0, 170.0 / 255.0, 240.0 / 255.0); // Blue sky during the day

    vec3 sunColor = vec3(1.0, 1.0, 0.0);
    vec3 moonColor = vec3(246.0/255.0, 241.0/255.0, 213.0/255.0);


    // calculate solar positions
    vec2 solarCenter = vec2(0.5 , 0.0); // anchor point to rotate around
    vec2 solarRange = vec2(0.4 , 0.8); // maximum path radius
    float solarSpeed = 0.0005;

    float xModifier = sin(u_time * u_speed * solarSpeed ); // -1 to 1 path
    float yModifier = cos(u_time * u_speed * solarSpeed ); // -1 to 1 path

    vec2 sunPos = vec2(solarCenter + vec2(xModifier,yModifier) * solarRange) * u_resolution;
    vec2 moonPos = vec2(solarCenter + vec2(-xModifier,-yModifier) * solarRange) * u_resolution;

    float sunDist = length(r_xy - sunPos);
    float sunFactor = step(sunDist, SUN_SIZE);

    float moonDist = length(r_xy - moonPos);
    float moonFactor = step(moonDist,MOON_SIZE);

    // // Mix the colors directly
    // vec3 finalColor = mix(colorDay, sunColor, sunFactor);
    // finalColor = mix(finalColor, moonColor, moonFactor);
    // outColor = vec4(finalColor, 1.0);

    // calculate sky color
    // if sun above 0.3 => day color
    // if sun 0-0.3 gradient break color
    // if sun below 0.0 => night color

    float isDayTime = step(yModifier,0.0);
    vec3 colorSky = mix(colorDay,colorNight,isDayTime);


    // Create a glow effect by blending SUN color with day color
    float sunGlowFactor = smoothstep(0.8*SUN_SIZE, SUN_SIZE*2.0, sunDist); // range 0-1
    vec3 sunGlowColor = mix(sunColor, colorSky, sunGlowFactor);
    float isSunZone = step(sunGlowFactor,0.0);

    vec3 finalColor = mix(sunGlowColor, moonColor, moonFactor);

    outColor = vec4(finalColor, 1.0);
}
`;

export default function BgSnowyDay() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glRef = useRef<WebGL2RenderingContext | null>(null);
  const [program, setProgram] = useState<WebGLProgram>();

  const daySpeedRef = useRef(1);

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
    const timeUniformLocation = gl.getUniformLocation(program, "u_time");
    const speedUniformLocation = gl.getUniformLocation(program, "u_speed");

    let animator = 0;
    const drawScene = (time: number) => {
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.useProgram(program);

      // pass the resolution as u_resolution
      gl.uniform2f(resolutionUniformLocation, screen_w, screen_h);

      // pass time as u_time
      gl.uniform1f(timeUniformLocation, time);

      // pass global speed as u_speed
      gl.uniform1f(speedUniformLocation, daySpeedRef.current);

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
