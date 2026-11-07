import { useEffect, useRef } from 'react';
import { publicPalette } from '../../../shared/theme/publicPalette';
import { FRAGMENT_SOURCE, VERTEX_SOURCE } from './smokeShaders';

/** Velocidad del humo (1 = original). Más bajo = más calmado. */
const TIME_SCALE = 0.3;
/** Suavizado del seguimiento del ratón por frame (0–1). Más bajo = más lento. */
const MOUSE_FOLLOW = 0.015;

interface SmokeyBackgroundProps {
  color?: string;
  /** Opacidad del humo (0–1) para no competir con el formulario. */
  intensity?: number;
}

function hexToRgb(hex: string): [number, number, number] {
  const value = (start: number) => parseInt(hex.slice(start, start + 2), 16) / 255;
  return [value(1), value(3), value(5)];
}

function compileShader(gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error('Shader compilation error:', gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

/** Fondo WebGL interactivo. El ratón se guarda en un ref para no reiniciar el efecto ni re-renderizar. */
export function SmokeyBackground({ color = publicPalette.smoke, intensity = 0.55 }: SmokeyBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext('webgl');
    if (!gl) return;

    const vertex = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SOURCE);
    const fragment = compileShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SOURCE);
    const program = gl.createProgram();
    if (!vertex || !fragment || !program) return;

    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program linking error:', gl.getProgramInfoLog(program));
      return;
    }
    gl.useProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
    const position = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

    const uResolution = gl.getUniformLocation(program, 'iResolution');
    const uTime = gl.getUniformLocation(program, 'iTime');
    const uMouse = gl.getUniformLocation(program, 'iMouse');
    gl.uniform3f(gl.getUniformLocation(program, 'u_color'), ...hexToRgb(color));

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const startedAt = performance.now();
    let frame = 0;
    let smoothed: { x: number; y: number } | null = null;

    const render = () => {
      const { clientWidth: width, clientHeight: height } = canvas;
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        gl.viewport(0, 0, width, height);
      }
      const target = mouseRef.current ?? { x: width / 2, y: height / 2 };
      smoothed = smoothed
        ? { x: smoothed.x + (target.x - smoothed.x) * MOUSE_FOLLOW, y: smoothed.y + (target.y - smoothed.y) * MOUSE_FOLLOW }
        : target;
      gl.uniform2f(uResolution, width, height);
      gl.uniform1f(uTime, reducedMotion ? 0 : ((performance.now() - startedAt) / 1000) * TIME_SCALE);
      gl.uniform2f(uMouse, smoothed.x, height - smoothed.y);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      if (!reducedMotion) frame = requestAnimationFrame(render);
    };

    const onMove = (event: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = { x: event.clientX - rect.left, y: event.clientY - rect.top };
    };
    const onLeave = () => {
      mouseRef.current = null;
    };
    window.addEventListener('mousemove', onMove);
    document.addEventListener('mouseleave', onLeave);

    render();

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseleave', onLeave);
      gl.deleteProgram(program);
      gl.deleteShader(vertex);
      gl.deleteShader(fragment);
      gl.deleteBuffer(buffer);
    };
  }, [color]);

  return <canvas ref={canvasRef} className="smokey-background" style={{ opacity: intensity }} aria-hidden="true" />;
}

