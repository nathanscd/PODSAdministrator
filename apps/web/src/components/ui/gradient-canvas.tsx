"use client";

import { useRef, useEffect } from "react";

const vertexShader = `
  attribute vec2 aPosition;
  void main() {
    gl_Position = vec4(aPosition, 0.0, 1.0);
  }
`;

const fragmentShader = `
  precision highp float;

  uniform float uTime;
  uniform vec2 uResolution;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  float smoothNoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }

  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 6; i++) {
      v += a * smoothNoise(p);
      p *= 2.02;
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / uResolution.xy;
    vec2 aspect = vec2(uResolution.x / uResolution.y, 1.0);
    vec2 p = uv * aspect;

    float t = uTime * 0.08;

    vec2 warp1 = vec2(
      fbm(p * 0.9 + t + vec2(2.1, 0.5)),
      fbm(p * 0.9 + t + vec2(7.3, 4.2))
    );

    vec2 warp2 = vec2(
      fbm(p * 1.4 + warp1 * 2.5 + t * 1.2 + vec2(3.7, 1.8)),
      fbm(p * 1.4 + warp1 * 2.5 + t * 1.2 + vec2(9.1, 6.4))
    );

    vec2 q = p + warp2 * 0.55;

    float n1 = fbm(q * 1.1 + t * 0.6);
    float n2 = fbm(q * 0.7 - t * 0.4 + vec2(4.1, 2.8));
    float n3 = fbm(q * 0.5 + t * 0.3 + vec2(7.5, 3.2));

    vec3 white    = vec3(0.98, 0.97, 0.99);
    vec3 pink     = vec3(0.96, 0.82, 0.88);
    vec3 peach    = vec3(1.0, 0.86, 0.82);
    vec3 lavender = vec3(0.88, 0.82, 0.96);
    vec3 mint     = vec3(0.84, 0.94, 0.92);
    vec3 blush    = vec3(0.99, 0.91, 0.89);

    vec3 col = white;
    col = mix(col, pink,     smoothstep(0.25, 0.75, n1) * 0.5);
    col = mix(col, peach,    smoothstep(0.3, 0.8, n2) * 0.45);
    col = mix(col, lavender, smoothstep(0.3, 0.7, n3) * 0.4);
    col = mix(col, mint,     smoothstep(0.4, 0.85, fbm(q * 2.5 + t * 0.9)) * 0.3);
    col = mix(col, blush,    smoothstep(0.35, 0.75, fbm(q * 0.6 - t * 0.2 + vec2(1.1, 5.7))) * 0.35);

    float bright = fbm(q * 5.0 + t * 1.5);
    col += vec3(0.9, 0.85, 0.95) * smoothstep(0.55, 0.85, bright) * 0.15;

    float vignette = 1.0 - smoothstep(0.35, 1.2, length(uv - 0.5) * 1.4);
    col *= vignette * 0.25 + 0.75;

    col = clamp(col, 0.0, 1.0);
    col = pow(col, vec3(0.92));

    gl_FragColor = vec4(col, 1.0);
  }
`;

export function GradientCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", { alpha: false, antialias: false });
    if (!gl) return;

    const compileShader = (type: number, source: string) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      return shader;
    };

    const vs = compileShader(gl.VERTEX_SHADER, vertexShader);
    const fs = compileShader(gl.FRAGMENT_SHADER, fragmentShader);
    if (!vs || !fs) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    gl.useProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW
    );

    const aPosition = gl.getAttribLocation(program, "aPosition");
    gl.enableVertexAttribArray(aPosition);
    gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);

    const uTime = gl.getUniformLocation(program, "uTime");
    const uResolution = gl.getUniformLocation(program, "uResolution");

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio, 2);
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    resize();

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);

    let startTime = performance.now();
    let animFrame: number;

    const render = () => {
      const now = performance.now();
      gl.uniform1f(uTime, (now - startTime) / 1000);
      gl.uniform2f(uResolution, canvas.width, canvas.height);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      animFrame = requestAnimationFrame(render);
    };

    animFrame = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animFrame);
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full rounded-lg"
      style={{ display: "block" }}
    />
  );
}
